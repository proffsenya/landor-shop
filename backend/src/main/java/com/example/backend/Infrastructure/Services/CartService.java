package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemService cartItemService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository  cartItemRepository;
    private final ProductVariantRepository productVariantRepository;

    public  CartService(CartRepository cartRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        CartItemRepository cartItemRepository,
                        CartItemService cartItemService,
                        ProductVariantRepository productVariantRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartItemService = cartItemService;
        this.productVariantRepository = productVariantRepository;

    }

    @Transactional
    public Cart addProductVariantToCart(Long userId, Long productVariantId) throws InvalidRequestException {
        User user = userRepository.findById(userId).orElseThrow(()->new InvalidRequestException("User not found"));
        ProductVariant variant =  productVariantRepository.findById(productVariantId).orElseThrow(()->new InvalidRequestException("Product not found"));

        Cart cart = cartRepository.findByUser(user).orElseGet(()->newCart(user));
        CartItem savedItem = cartItemService.addItemToCart(cart, variant, 1);

        cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(savedItem.getId()));
        cart.getCartItems().add(savedItem);

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart getCartByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        return cartRepository.findByUser(user)
                .orElseGet(()->newCart(user));
    }

    @Transactional
    public Cart removeCartItem(Long userId, Long productVariantId) throws InvalidRequestException {
        User user = userRepository.findById(userId).orElseThrow(()->new InvalidRequestException("User not found"));
        ProductVariant variant =  productVariantRepository.findById(productVariantId).orElseThrow(()->new InvalidRequestException("Product not found"));

        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        if (cartOpt.isEmpty()) {
            throw new InvalidRequestException("Cart not found");
        }

        Cart cart = cartOpt.get();
        CartItem existing = cartItemRepository.findByCartAndProductVariant(cart, variant);
        if (existing == null){
            throw new InvalidRequestException("Item not found in cart");
        }

        cartItemService.removeItemFromCart(cart, variant, existing.getQuantity());
        cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(existing.getId()));
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) throws InvalidRequestException {
        User user = userRepository.findById(userId).orElseThrow(()->new InvalidRequestException("User not found"));
        Cart cart = cartRepository.findByUser(user).orElseThrow(()->new InvalidRequestException("Cart is empty"));

        cartItemService.deleteAllFromCart(cart);
    }


    public BigDecimal calculateCartTotal(Cart cart) {
        return cart.getCartItems().stream()
                .map(item -> item.getPriceAtAdded().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Cart newCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart incrementCartItem(Long userId, Long productVariantId) throws InvalidRequestException {
        return changeCartItemQuantity(userId, productVariantId, +1);
    }

    @Transactional
    public Cart decrementCartItem(Long userId, Long productVariantId) throws InvalidRequestException {
        return changeCartItemQuantity(userId, productVariantId, -1);
    }

    @Transactional
    public Cart changeCartItemQuantity(Long userId, Long productVariantId, int delta) throws InvalidRequestException {
        if (delta == 0) {
            return getCartByUserId(userId);
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidRequestException("User not found"));

        ProductVariant variant = productVariantRepository.findById(productVariantId).orElseThrow(() -> new InvalidRequestException("Product not found"));

        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        if (cartOpt.isEmpty()) {
            if (delta > 0) {
                return addProductVariantToCart(userId, productVariantId);
            } else {
                throw new InvalidRequestException("Item not found in cart");
            }
        }
        Cart cart = cartOpt.get();

        int updated = cartItemRepository.changeQuantityIfResultPositive(cart.getId(), productVariantId, delta);
        if (updated > 0) {
            CartItem saved = cartItemRepository.findByCartAndProductVariant(cart, variant);
            if (saved != null) {
                cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(saved.getId()));
                cart.getCartItems().add(saved);
            }
            return cartRepository.save(cart);
        }

        CartItem existing = cartItemRepository.findByCartAndProductVariant(cart, variant);

        if (existing == null) {
            if (delta > 0) {
                CartItem saved = cartItemService.addItemToCart(cart, variant, delta);
                cart.getCartItems().removeIf(ci -> ci.getProductVariant() != null && ci.getProductVariant().getId().equals(variant.getId()));
                cart.getCartItems().add(saved);
                return cartRepository.save(cart);
            } else {
                throw new InvalidRequestException("Item not found in cart");
            }
        } else {
            int newQty = existing.getQuantity() + delta;
            if (newQty <= 0) {
                cartItemRepository.deleteIfQuantityNonPositive(cart.getId(), productVariantId);
                cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(existing.getId()));
                return cartRepository.save(cart);
            } else {
                existing.setQuantity(newQty);
                CartItem saved = cartItemRepository.save(existing);
                cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(saved.getId()));
                cart.getCartItems().add(saved);
                return cartRepository.save(cart);
            }
        }
    }


}
