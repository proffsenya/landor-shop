package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.example.backend.Domain.Models.User}
 */
public record UserProfileDTO(@NotNull @Size(max = 100) String email, @Size(max = 100) String firstName,
                             @Size(max = 100) String lastName, Instant createdAt, Instant updatedAt,
                             @Size(max = 20) String phone, @Size(max = 100) String middleName) implements Serializable {
}