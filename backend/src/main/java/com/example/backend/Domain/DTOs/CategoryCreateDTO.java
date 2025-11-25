package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.Category}
 */
public record CategoryCreateDTO(@Size(max = 50) String name, @Size(max = 255) String description,
                                @Size(max = 50) String slug) implements Serializable {
}