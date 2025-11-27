package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.BrandCreateDTO;
import com.example.backend.Domain.DTOs.BrandDTO;
import com.example.backend.Infrastructure.Repos.BrandRepository;
import com.example.backend.Infrastructure.Services.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
class BrandController {
    private final BrandService brandService;
    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandCreateDTO dto) {
        return ResponseEntity.ok(brandService.createBrand(dto));
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable long brandId) {
        return ResponseEntity.ok(brandService.getBrandById(brandId));
    }

    @DeleteMapping("/{brandId}")
    public ResponseEntity<?> deleteBrandById(@PathVariable long brandId) {
        brandService.deleteBrandById(brandId);
        return ResponseEntity.noContent().build();
    }
}
