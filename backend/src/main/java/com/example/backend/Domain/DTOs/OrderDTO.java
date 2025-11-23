package com.example.backend.Domain.DTOs;

import com.example.backend.Domain.Models.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DTO for {@link com.example.backend.Domain.Models.Order}
 */
public record OrderDTO(Long id, @NotNull @Size(max = 50) String orderStatus, @NotNull BigDecimal totalAmount,
                       Map<String, Object> customerSnapshot,
                       Map<String, Object> billingAddress,
                       Map<String, Object> shippingAddress,
                       @NotNull @Size(max = 50) String paymentStatus, Instant createdAt, List<OrderItemDTO> items) implements Serializable {

    public static OrderDTO from(Order order) {
        var items = order.getOrderItems().stream()
                .map(OrderItemDTO::from)
                .collect(Collectors.toList());
        return new OrderDTO(order.getId(), order.getOrderStatus(), order.getTotalAmount(),
                order.getCustomerSnapshot(), order.getBillingAddress(), order.getShippingAddress(),
                order.getPaymentStatus(),
                order.getCreatedAt(), items);
    }
}