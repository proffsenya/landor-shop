package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.ProductImage}
 */
public record ProductImageDTO(Long id, Boolean isMain,
                              @Size(max = 255) String altText,
                              Long productVariantId) implements Serializable {
}