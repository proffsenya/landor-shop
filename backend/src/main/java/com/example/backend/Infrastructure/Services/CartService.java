package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

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
    public Cart addProductVariantToCart(Long userId, Long productVariantId, Integer quantity) throws InvalidRequestException {
        if (quantity == null || quantity <= 0) {
            throw new InvalidRequestException("Quantity must be positive");
        }
        User user = userRepository.findById(userId).orElseThrow(()->new InvalidRequestException("User not found"));
        ProductVariant variant =  productVariantRepository.findById(productVariantId).orElseThrow(()->new InvalidRequestException("Product not found"));

        Cart cart = cartRepository.findByUser(user).orElseGet(()->newCart(user));
        CartItem savedItem = cartItemService.addItemToCart(cart, variant, quantity);

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
    public Cart removeCartItem(Long userId, Long productVariantId, Integer quantity) throws InvalidRequestException {
        User user = userRepository.findById(userId).orElseThrow(()->new InvalidRequestException("User not found"));
        ProductVariant variant =  productVariantRepository.findById(productVariantId).orElseThrow(()->new InvalidRequestException("Product not found"));

        Cart cart = cartRepository.findByUser(user).orElseGet(()->newCart(user));
        CartItem updated = cartItemService.removeItemFromCart(cart, variant, quantity);

        if (updated != null) {
            cart.getCartItems().removeIf(ci -> ci.getId() != null && ci.getId().equals(updated.getId()));
            cart.getCartItems().add(updated);
        }
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

}
