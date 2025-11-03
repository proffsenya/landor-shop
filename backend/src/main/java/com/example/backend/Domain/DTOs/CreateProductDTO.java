package com.example.backend.Domain.DTOs;

import com.example.backend.Domain.Models.ProductVariant;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record CreateProductDTO(@Size(max = 100) String name, @Size(max = 1000) String description,
                               @Size(max = 100) String slug, @NotNull Integer quantityInStock,
                               List<Integer> breedIds,
                               List<Integer> categoryIds,
                               List<Integer> countryIds,
                               List<Integer> typeoffoodIds,
                               List<Long> flavorIds,
                               List<VariantDTO> variants,
                               Long brandId,
                               Long productTypeId
                               ) implements Serializable {
}