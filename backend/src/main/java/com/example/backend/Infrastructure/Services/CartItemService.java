package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.Cart;
import com.example.backend.Domain.Models.CartItem;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductVariant;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.CartItemRepository;
import com.example.backend.Infrastructure.Repos.CartRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;

@Service
public class CartItemService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    public CartItemService(CartItemRepository cartItemRepository, ProductRepository productRepository, UserRepository userRepository, CartRepository cartRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
    }

    @Transactional
    public CartItem addItemToCart(Cart cart, ProductVariant variant, Integer quantity) throws InvalidRequestException {
        if (quantity == null || quantity <= 0) {
            throw new InvalidRequestException("Quantity must be positive");
        }

        if (variant == null) {
            throw new InvalidRequestException("Variant not found");
        }

        if (variant.getStock() != null && variant.getStock() < quantity) {
            throw new InvalidRequestException("Not enough stock for variant");
        }

        if (cart.getId() == null) {
            cart = cartRepository.save(cart);
        }
        CartItem existingItem = cartItemRepository.findByCartAndProductVariant(cart, variant);

        if (existingItem != null) {
            int newQty = existingItem.getQuantity() + quantity;
            if (variant.getStock() != null && newQty > variant.getStock()) {
                throw new InvalidRequestException("Not enough stock");
            }
            existingItem.setQuantity(newQty);
            CartItem saved = cartItemRepository.save(existingItem);

            boolean present = cart.getCartItems().stream()
                    .anyMatch(ci -> ci.getId() != null && ci.getId().equals(saved.getId()));
            if (!present) {
                cart.getCartItems().removeIf(ci -> ci.getProductVariant() != null && ci.getProductVariant().getId().equals(variant.getId()));
                cart.getCartItems().add(saved);
            } else {
                cart.getCartItems().stream()
                        .filter(ci -> ci.getId() != null && ci.getId().equals(saved.getId()))
                        .findFirst()
                        .ifPresent(ci -> {
                            ci.setQuantity(saved.getQuantity());
                            ci.setPriceAtAdded(saved.getPriceAtAdded());
                        });
            }

            return saved;
        }
        else{
            String disp = variant.getDisplayName();
            if (disp == null || disp.isBlank()) {
                disp = variant.getProduct() != null ? (variant.getProduct().getName() + (variant.getWeight() != null ? ", " + variant.getWeight() + " кг" : "")) : null;
            }
            String mainImageUrl = variant.getProduct().getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsMain())).findFirst()
                    .map(img-> "/api/images/" + img.getId()).orElse(null);
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProductVariant(variant);
            cartItem.setQuantity(quantity);
            cartItem.setPriceAtAdded(variant.getPrice());
            cartItem.setImageUrlAtAdded(mainImageUrl);
            cartItem.setDisplayNameAtAdded(disp);

            CartItem saved;
            try {
                saved = cartItemRepository.save(cartItem);
            } catch (DataIntegrityViolationException ex) {
                CartItem raceItem = cartItemRepository.findByCartAndProductVariant(cart, variant);
                if (raceItem != null) {
                    raceItem.setQuantity(raceItem.getQuantity() + quantity);
                    saved = cartItemRepository.save(raceItem);
                } else {
                    throw new InvalidRequestException("Failed to add item to cart (concurrency issue)");
                }
            }

            cart.getCartItems().removeIf(ci -> ci.getProductVariant() != null && ci.getProductVariant().getId().equals(variant.getId()));
            cart.getCartItems().add(saved);

            return saved;
        }
    }

    public CartItem removeItemFromCart(Cart cart, ProductVariant variant, Integer quantity) throws InvalidRequestException {
        if (quantity == null || quantity <= 0) {
            throw new InvalidRequestException("Quantity to remove must be positive");
        }

        if (cart.getId() == null) {
            throw new InvalidRequestException("Cart not persisted");
        }

        CartItem existingItem = cartItemRepository.findByCartAndProductVariant(cart, variant);
        if (existingItem == null) {
            throw new InvalidRequestException("Item not found in cart");
        }
        int newQuantity = existingItem.getQuantity() - quantity;
        if (newQuantity < 0) {
            throw new InvalidRequestException("Quantity to remove must be positive");
        }
        if (newQuantity == 0) {
            cartItemRepository.delete(existingItem);
            cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(existingItem.getId()));
            return null;
        }
        else {
            existingItem.setQuantity(newQuantity);
            CartItem saved = cartItemRepository.save(existingItem);

            cart.getCartItems().stream()
                    .filter(ci -> ci.getId() != null && ci.getId().equals(saved.getId()))
                    .findFirst()
                    .ifPresent(ci -> ci.setQuantity(saved.getQuantity()));
            return saved;
        }
    }

    @Transactional
    public void deleteAllFromCart(Cart cart) throws InvalidRequestException {
        if (cart.getId() == null) {
            cart.getCartItems().clear();
            return;
        }

        Cart currentcart = cartRepository.findById(cart.getId()).orElseThrow(()->new InvalidRequestException("Cart is not found"));
        cartItemRepository.deleteAllByCart(currentcart);
        currentcart.getCartItems().clear();
        cartRepository.save(currentcart);
    }
}
