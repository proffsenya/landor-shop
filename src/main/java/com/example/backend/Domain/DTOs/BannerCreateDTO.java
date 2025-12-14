package com.example.backend.Domain.DTOs;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.Banner}
 */
public record BannerCreateDTO(Boolean isActive) implements Serializable {
}