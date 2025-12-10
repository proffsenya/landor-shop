package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * DTO for {@link com.example.backend.Domain.Models.Order}
 */
public record OrderUpdateDTO(@NotNull @Size(max = 50) String orderStatus, @NotNull BigDecimal totalAmount,
                             @NotNull @Size(max = 50) String paymentStatus,
                             @NotNull Map<String, Object> shippingAddress,
                             @NotNull Map<String, Object> billingAddress, @Size(max = 255) String customerNotes,
                             List<OrderItemUpdateDTO> orderItems, Map<String, Object> customerSnapshot,
                             @Size(max = 250) String paymentMethod) implements Serializable {
}