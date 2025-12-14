package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.BrandCreateDTO;
import com.example.backend.Domain.DTOs.BrandDTO;
import com.example.backend.Domain.Models.Brand;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class BrandService {
    private final BrandRepository brandRepository;
    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Transactional
    public BrandDTO createBrand(BrandCreateDTO dto) {
        if (dto == null) {
            throw new InvalidRequestException("BrandCreateDTO is null");
        }
        if (brandRepository.findByName(dto.name()).isPresent()) {
            throw new InvalidRequestException("BrandCreateDTO with this name is already exists");
        }
        Brand brand = new Brand();
        brand.setName(dto.name());
        brand.setSlug(dto.slug());

        Brand newbrand = brandRepository.save(brand);
        return new BrandDTO(
                newbrand.getId(),
                newbrand.getName(),
                newbrand.getSlug()
        );
    }

    @Transactional
    public BrandDTO getBrandById(Long id) {
        if (!brandRepository.findById(id).isPresent() || id == null || id <= 0) {
            throw new InvalidRequestException("Brand with id " + id + " does not exist");
        }
        Brand brand = brandRepository.findById(id).get();
        return new BrandDTO(
                brand.getId(),
                brand.getName(),
                brand.getSlug()
        );
    }

    @Transactional
    public List<BrandDTO> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();
        List<BrandDTO> brandDTOs = new ArrayList<>();
        for (Brand brand : brands) {
            brandDTOs.add(new BrandDTO(brand.getId(), brand.getName(), brand.getSlug()));
        }
        return brandDTOs;
    }

    @Transactional
    public void deleteBrandById(Long id) {
        if (brandRepository.existsById(id)) {
            brandRepository.deleteById(id);
        }
    }
}
