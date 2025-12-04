package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.User}
 */
public record AdminCreateUserRequestDTO(@NotNull @Size(max = 100) String email, @Size(max = 100) String firstName,
                                        @Size(max = 100) String lastName, @NotNull @Size(max = 255) String passwordHash,
                                        Boolean isStaff, Boolean isActive, @Size(max = 20) String phone,
                                        @Size(max = 100) String middleName) implements Serializable {
}