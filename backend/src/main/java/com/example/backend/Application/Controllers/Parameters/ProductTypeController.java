package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.ProductTypeCreateDTO;
import com.example.backend.Domain.DTOs.ProductTypeDTO;
import com.example.backend.Infrastructure.Services.ProductTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/productTypes")
class ProductTypeController {
    private final ProductTypeService productTypeService;
    public ProductTypeController(ProductTypeService productTypeService) {
        this.productTypeService = productTypeService;
    }

    @GetMapping("/{productTypeId}")
    public ResponseEntity<ProductTypeDTO> getProductType(@PathVariable Long productTypeId){
        return  ResponseEntity.ok(productTypeService.getProductTypeById(productTypeId));
    }

    @GetMapping
    public ResponseEntity<List<ProductTypeDTO>> getAllProductTypes(){
        return ResponseEntity.ok(productTypeService.getAllProductTypes());
    }

    @PostMapping
    public ResponseEntity<ProductTypeDTO> createProductType(@RequestBody ProductTypeCreateDTO dto){
        return ResponseEntity.ok(productTypeService.createProductType(dto));
    }

    @DeleteMapping("/{productTypeId}")
    public ResponseEntity<?> deleteProductTypeById(@PathVariable Long productTypeId) {
        productTypeService.deleteProductTypeById(productTypeId);
        return ResponseEntity.noContent().build();
    }
}
