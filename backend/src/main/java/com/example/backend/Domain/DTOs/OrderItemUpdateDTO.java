package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.example.backend.Domain.Models.OrderItem}
 */
public record OrderItemUpdateDTO(Long id, Long productVariantId, @NotNull Integer quantity,
                                 @NotNull BigDecimal price) implements Serializable {
}