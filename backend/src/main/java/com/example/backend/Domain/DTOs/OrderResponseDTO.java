package com.example.backend.Domain.DTOs;

import com.example.backend.Domain.Models.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DTO for {@link com.example.backend.Domain.Models.Order}
 */
public record OrderResponseDTO(Long id, @NotNull @Size(max = 50) String orderStatus, @NotNull BigDecimal totalAmount,
                               @NotNull @Size(max = 50) String paymentStatus,
                               @NotNull Map<String, Object> shippingAddress,
                               @NotNull Map<String, Object> billingAddress, @Size(max = 255) String customerNotes,
                               Instant createdAt) implements Serializable {

}