package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.User}
 */
public record ChangePasswodDTO(
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        String newPassword,

        @NotBlank(message = "Password confirmation is required")
        String confirmPassword
) {}