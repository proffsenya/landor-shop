package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.User}
 */
public record LoginRequestDTO(@NotNull @Size(max = 100) String email,
                              @NotNull @Size(min = 8, max = 255) String passwordHash) implements Serializable {
}