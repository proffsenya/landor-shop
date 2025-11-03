package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record ProductCardDTO(Long id, @Size(max = 100) String productName,
                             List<VariantCardDTO> variants
                             ) implements Serializable {
}