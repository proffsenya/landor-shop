package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.example.backend.Domain.Models.Product}
 */
public record CreateProductDTO(@Size(max = 100) String name, @Size(max = 1000) String description,
                               @Size(max = 100) String slug, @NotNull Integer quantityInStock,
                               @NotNull @Size(max = 255) String sku,
                               @NotNull BigDecimal price,
                               BigDecimal oldPrice) implements Serializable {
}