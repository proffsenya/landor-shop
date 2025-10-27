package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record ProductCardDTO(Long id, @Size(max = 100) String name,
                             @NotNull BigDecimal price,
                             BigDecimal rating,
                             String mainImageUrl,
                             Boolean isFeatured
                             ) implements Serializable {
}