package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.Map;

/**
 * DTO for {@link com.example.backend.Domain.Models.Order}
 */
public record CreateOrderRequestDTO(@NotNull Map<String, Object> shippingAddress,
                                    @Size(max = 255) String customerNotes) implements Serializable {
}