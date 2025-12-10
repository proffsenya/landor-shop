package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.BannerCreateDTO;
import com.example.backend.Domain.DTOs.BannerDTO;
import com.example.backend.Domain.Models.Banner;
import com.example.backend.Infrastructure.Services.BannerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerService bannerService;

    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF') or hasRole('SUPERUSER')")
    public ResponseEntity<BannerDTO> uploadBanner(@RequestPart("file") MultipartFile file,
                                                  @RequestPart("bannerDto") @Valid BannerCreateDTO dto) throws IOException {
        Banner banner = bannerService.createBanner(file, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(BannerDTO.from(banner));
    }

    @GetMapping
    public ResponseEntity<List<BannerDTO>> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();
        List<BannerDTO> bannerDTOs = banners.stream()
                .map(BannerDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bannerDTOs);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getBannerImage(@PathVariable Long id) {
        return bannerService.getBannerImage(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') or hasRole('SUPERUSER')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BannerDTO> getBanner(@PathVariable Long id) {
        Banner banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(BannerDTO.from(banner));
    }
}
