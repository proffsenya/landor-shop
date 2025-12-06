package com.example.backend.Domain.DTOs;

import com.example.backend.Domain.Models.OrderItem;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for {@link com.example.backend.Domain.Models.OrderItem}
 */
public record OrderItemDTO(Long id, Long productId, @NotNull @Size(max = 250) String productName, @NotNull Integer quantity,
                           BigDecimal weight,
                           @NotNull BigDecimal totalPrice) implements Serializable {
    public static OrderItemDTO from(OrderItem oi) {
        Long variantId = null;
        if (oi.getProductVariant() != null){
            variantId = oi.getProductVariant().getId();
        }
        return new OrderItemDTO(oi.getId(), variantId, oi.getProductName(), oi.getQuantity(), oi.getWeight(), oi.getTotalPrice());
    }
}