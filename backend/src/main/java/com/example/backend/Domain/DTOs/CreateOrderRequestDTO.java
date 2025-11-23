package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * DTO for {@link com.example.backend.Domain.Models.Order}
 */
public record CreateOrderRequestDTO(List<Long> cartItemIds, @NotNull Map<String, Object> billingAddress,
                                    @NotNull Map<String, Object> shippingAddress,
                                    Map<String, Object> customerSnapshot,
                                    @Size(max = 255) String customerNotes) implements Serializable {
}