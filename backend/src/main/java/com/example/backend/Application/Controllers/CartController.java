package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.CartItemDTO;
import com.example.backend.Domain.DTOs.CartResponseDTO;
import com.example.backend.Domain.Models.Cart;
import com.example.backend.Domain.Models.CartItem;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Services.CartService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    public static record AddToCartRequest(Long variantId, Integer quantity) {}

    @PostMapping
    public ResponseEntity<CartResponseDTO> createCart(@AuthenticationPrincipal CustomUserDetails principal,
                                                      @RequestBody AddToCartRequest request) throws InvalidRequestException {
        Long userId = principal.getId();
        Cart cart = cartService.addProductVariantToCart(userId, request.variantId(), request.quantity());
        CartResponseDTO dto = toCartResponseDTO(cart);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(@AuthenticationPrincipal CustomUserDetails principal) throws InvalidRequestException {
        Long userId = principal.getId();
        return ResponseEntity.ok(toCartResponseDTO(cartService.getCartByUserId(userId)));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCart(@AuthenticationPrincipal CustomUserDetails principal) throws InvalidRequestException {
        Long userId = principal.getId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<Void> deleteItemFromCart(@AuthenticationPrincipal CustomUserDetails principal,
                                                   @RequestBody AddToCartRequest request) throws InvalidRequestException {
        Long userId = principal.getId();
        cartService.removeCartItem(userId, request.variantId(), request.quantity());
        return ResponseEntity.noContent().build();
    }

    private CartResponseDTO toCartResponseDTO(Cart cart) {
        List<CartItemDTO> cartItemDTOs = cart.getCartItems().stream()
                .map(this::toCartItemDTO)
                .toList();

        BigDecimal total = cart.getCartItems().stream()
                .map(item -> item.getPriceAtAdded().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponseDTO(
                cart.getId(),
                cart.getCreatedAt(),
                cartItemDTOs,
                total
        );
    }

    private CartItemDTO toCartItemDTO(CartItem cartItem) {
        return new CartItemDTO(
                cartItem.getId(),
                cartItem.getQuantity(),
                cartItem.getPriceAtAdded(),
                cartItem.getCreatedAt(),
                cartItem.getProductVariant().getId(),
                cartItem.getDisplayNameAtAdded(),
                cartItem.getPriceAtAdded()
        );
    }
}
