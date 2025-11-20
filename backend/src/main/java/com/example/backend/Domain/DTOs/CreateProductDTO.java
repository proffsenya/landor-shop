package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record CreateProductDTO(@Size(max = 100) String name, @Size(max = 1000) String description,
                               @Size(max = 1000) String feedingNote,
                               @Size(max = 500) String guaranteedIndicators,
                               @Size(max = 100) String slug,
                               List<Integer> breedIds,
                               List<Integer> categoryIds,
                               List<Integer> countryIds,
                               List<Integer> typeoffoodIds,
                               List<Long> flavorIds,
                               List<CreateVariantDTO> variants,
                               Long brandId,
                               Long productTypeId
                               ) implements Serializable {
}