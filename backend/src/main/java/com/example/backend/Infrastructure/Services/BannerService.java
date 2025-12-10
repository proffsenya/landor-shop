package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.BannerCreateDTO;
import com.example.backend.Domain.Models.Banner;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourseNotFoundException;
import com.example.backend.Infrastructure.Repos.BannerRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @Transactional
    public Banner createBanner(MultipartFile file, BannerCreateDTO dto) throws IOException {
        validateImageFile(file);

        Banner banner = new Banner();
        banner.setImageData(file.getBytes());
        banner.setContentType(file.getContentType());
        banner.setFileName(file.getOriginalFilename());
        banner.setSize(file.getSize());
        banner.setIsActive(dto.isActive());

        return bannerRepository.save(banner);
    }

    @Transactional(readOnly = true)
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }


    @Transactional(readOnly = true)
    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Banner not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getBannerImage(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Banner not found with id: " + id));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(banner.getContentType()))
                .body(banner.getImageData());
    }

    @Transactional(readOnly = true)
    public String getBannerImageUrl(Long bannerId) {
        if (!bannerRepository.existsById(bannerId)) {
            return null;
        }
        return "/api/banners/" + bannerId + "/image";
    }

    @Transactional
    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new InvalidRequestException("Banner not found with id: " + id);
        }
        bannerRepository.deleteById(id);
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidRequestException("File must be an image. Received: " + contentType);
        }

        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new InvalidRequestException("File size must be less than 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String lowerCaseFilename = originalFilename.toLowerCase();
            if (!lowerCaseFilename.matches(".*\\.(jpg|jpeg|png|gif|webp|bmp)$")) {
                throw new InvalidRequestException("Unsupported file format. Only JPG, JPEG, PNG, GIF, WEBP, BMP are allowed");
            }
        }
    }
}
