package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.example.backend.Domain.Models.ProductVariant}
 */
public record VariantCardDTO(Long id, @Size(max = 500) String displayName, BigDecimal price, Integer stock,
                             String imageUrl) implements Serializable {
}