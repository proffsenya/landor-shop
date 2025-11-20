package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record UpdateProductDTO(@Size(max = 100) String name, @Size(max = 1000) String description,
                               @Size(max = 500) String guaranteedIndicators,
                               @Size(max = 100) String feedingNote,
                               @Size(max = 100) String slug, @NotNull Integer quantityInStock,
                               Boolean isActive, Boolean isFeatured, BigDecimal rating,
                               List<Integer> breedIds,
                               List<Integer> categoryIds,
                               List<Integer> countryIds,
                               List<Integer> typeoffoodIds,
                               List<Long> flavorIds,
                               List<ResponseVariantDTO> variants,
                               Long brandId,
                               Long productTypeId
                         ) implements Serializable {
}