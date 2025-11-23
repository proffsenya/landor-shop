package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.ProductVariant}
 */
public record ResponseVariantDTO(Long id, Long productId, @Size(max = 120) String sku, BigDecimal price, BigDecimal oldPrice,
                                 Integer stock, BigDecimal weight,
                                 List<ColorDTO> colorIds,    // ДОБАВИТЬ
                                 List<ScentDTO> scentIds,
                                 @Size(max = 500) String displayName) implements Serializable {
}