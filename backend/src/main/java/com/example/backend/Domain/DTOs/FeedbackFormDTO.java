package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.FeedbackForm}
 */
public record FeedbackFormDTO(@Size(max = 255) String name, @Size(max = 50) String phone, @Size(max = 255) String email,
                              @Size(max = 255) String city, String comment) implements Serializable {
}