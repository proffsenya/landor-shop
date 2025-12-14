package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.ProductVariant}
 */
public record CreateVariantDTO(@Size(max = 120) String sku, BigDecimal price, Integer stock,
                               BigDecimal weight, List<Long> colorIds,    // ДОБАВИТЬ
                               List<Long> scentIds  ) implements Serializable {
}