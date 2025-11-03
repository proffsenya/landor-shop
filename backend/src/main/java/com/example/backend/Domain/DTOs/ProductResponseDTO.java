package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record ProductResponseDTO(Long id, @Size(max = 100) String name, @Size(max = 1000) String description,
                                 @Size(max = 100) String slug,
                                 Boolean isActive, Boolean isFeatured, BigDecimal rating,
                                 List<BreedDTO> breedsDTOs,
                                 List<CategoryDTO> categoryDTOs,
                                 List<CountryDTO> countryDTOs,
                                 List<TypeOfFoodDTO> typeOfFoodDTOs,
                                 List<ProductImageDTO> productImageDTOs,
                                 List<FlavorDTO> flavorIds,
                                 List<VariantDTO> variants,
                                 Long brandId,
                                 Long productTypeId

    ) implements Serializable {
}