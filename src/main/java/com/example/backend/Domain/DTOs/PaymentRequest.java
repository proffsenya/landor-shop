package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.example.backend.Domain.Models.PaymentTransaction}
 */
public record PaymentRequest(@NotNull BigDecimal amount,
                             @NotNull @Size(max = 255) String paymentMethod) implements Serializable {
}