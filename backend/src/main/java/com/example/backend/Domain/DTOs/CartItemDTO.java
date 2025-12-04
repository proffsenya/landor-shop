package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.example.backend.Domain.Models.CartItem}
 */
public record CartItemDTO(Long id,
                          Long variantId,
                          @NotNull Integer quantity,
                          @NotNull BigDecimal priceAtAdded,
                          Instant createdAt,
                          Long productId,
                          String displayName,
                          BigDecimal currentPrice,
                          String imageUrl
                          ) implements Serializable {
}