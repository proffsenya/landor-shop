package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.Color}
 */
public record ColorDTO(Long id, @NotNull @Size(max = 100) String name, String slug) implements Serializable {
}