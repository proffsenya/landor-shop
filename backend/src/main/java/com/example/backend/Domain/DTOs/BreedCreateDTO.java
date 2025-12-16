package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.Breed}
 */
public record BreedCreateDTO(@NotNull @Size(max = 100) String name,
                             @Size(max = 100) String slug,
                             Long categoryId) implements Serializable {
}