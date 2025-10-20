package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.example.backend.Domain.Models.User}
 */
public record UserResponseDTO(Long id, @NotNull @Size(min = 6, max = 100) String email,
                              @Size(min = 2, max = 100) String firstName, @Size(max = 100) String lastName,
                              Boolean isActive, Instant createdAt) implements Serializable {
}