package com.example.backend.Domain.DTOs;

import com.example.backend.Domain.Models.Banner;

import java.time.Instant;

public record BannerDTO(
        Long id,
        String contentType,
        String fileName,
        Long size,
        Instant createdAt,
        String imageUrl
) {
    public static BannerDTO from(Banner banner) {
        String imageUrl = "/api/banners/" + banner.getId() + "/image";
        return new BannerDTO(
                banner.getId(),
                banner.getContentType(),
                banner.getFileName(),
                banner.getSize(),
                banner.getCreatedAt(),
                imageUrl
        );
    }
}
