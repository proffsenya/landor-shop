package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.User}
 */
public record AuthResponseDTO(
        String token,
        String email,
        Boolean isStaff,
        Boolean isSuperUser
) implements Serializable {}