package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.Category}
 */
public record CategoryDTO(Long id, @Size(max = 50) String name, @NotNull @Size(max = 100) String slug) implements Serializable {
}