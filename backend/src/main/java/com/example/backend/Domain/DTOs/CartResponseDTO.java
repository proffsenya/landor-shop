package com.example.backend.Domain.DTOs;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * DTO for {@link com.example.backend.Domain.Models.Cart}
 */
public record CartResponseDTO(Long id,
                              Instant createdAt,
                              List<CartItemDTO> cartItems,
                              BigDecimal totalAmount) implements Serializable {
}
