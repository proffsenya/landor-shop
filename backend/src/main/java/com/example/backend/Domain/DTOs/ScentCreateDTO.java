package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.Scent}
 */
public record ScentCreateDTO(@NotNull @Size(max = 200) String name,
                             @Size(max = 100) String slug) implements Serializable {
}