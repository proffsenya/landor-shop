package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

/**
 * DTO for {@link com.example.backend.Domain.Models.Order}
 */
public record OrderSummaryDTO(Long id, @NotNull @Size(max = 50) String orderStatus, @NotNull BigDecimal totalAmount,
                              @NotNull @Size(max = 50) String paymentStatus,
                              @NotNull Map<String, Object> shippingAddress,
                              @NotNull Map<String, Object> billingAddress, @Size(max = 255) String customerNotes,
                              Instant createdAt, Instant updatedAt,
                              Map<String, Object> customerSnapshot) implements Serializable {
}