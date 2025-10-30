package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for {@link com.example.backend.Domain.Models.PaymentTransaction}
 */
public record ReceiptDTO(Long orderId, @Size(max = 255) String transactionId, @NotNull BigDecimal amount,
                         @NotNull @Size(max = 255) String paymentMethod, @NotNull @Size(max = 255) String paymentStatus, Instant createdAt) implements Serializable {
}