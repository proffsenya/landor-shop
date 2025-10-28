package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.Cart;
import com.example.backend.Domain.Models.CartItem;
import com.example.backend.Domain.Models.Product;
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
    public CartItem addItemToCart(Cart cart, Product product, Integer quantity) throws InvalidRequestException {
        if (quantity == null || quantity <= 0) {
            throw new InvalidRequestException("Quantity must be positive");
        }

        if (cart.getId() == null) {
            cart = cartRepository.save(cart);
        }
        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            CartItem saved = cartItemRepository.save(existingItem);

            boolean present = cart.getCartItems().stream()
                    .anyMatch(ci -> ci.getId() != null && ci.getId().equals(saved.getId()));
            if (!present) {
                cart.getCartItems().removeIf(ci -> ci.getProduct() != null && ci.getProduct().getId().equals(product.getId()));
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
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setPriceAtAdded(product.getPrice());

            CartItem saved;
            try {
                saved = cartItemRepository.save(cartItem);
            } catch (DataIntegrityViolationException ex) {
                CartItem raceItem = cartItemRepository.findByCartAndProduct(cart, product);
                if (raceItem != null) {
                    raceItem.setQuantity(raceItem.getQuantity() + quantity);
                    saved = cartItemRepository.save(raceItem);
                } else {
                    throw new InvalidRequestException("Failed to add item to cart (concurrency issue)");
                }
            }

            cart.getCartItems().removeIf(ci -> ci.getProduct() != null && ci.getProduct().getId().equals(product.getId()));
            cart.getCartItems().add(saved);

            return saved;
        }
    }

    public CartItem removeItemFromCart(Cart cart, Product product, Integer quantity) throws InvalidRequestException {
        if (quantity == null || quantity <= 0) {
            throw new InvalidRequestException("Quantity to remove must be positive");
        }

        if (cart.getId() == null) {
            throw new InvalidRequestException("Cart not persisted");
        }

        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product);
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
