package com.example.backend.Domain.DTOs;

import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO for {@link com.example.backend.Domain.Models.NurseryForm}
 */
public record NurseryFormDTO(@Size(max = 255) String organizationName, @Size(max = 255) String fullName,
                             @Size(max = 255) String city, @Size(max = 255) String email, @Size(max = 50) String phone,
                             byte[] registrationFile, @Size(max = 255) String fileName) implements Serializable {
}