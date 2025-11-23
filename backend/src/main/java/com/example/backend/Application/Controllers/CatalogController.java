package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.ProductCardDTO;
import com.example.backend.Domain.DTOs.VariantCardDTO;
import com.example.backend.Infrastructure.Services.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/api/products/cards")
class CatalogController {
    private final ProductService productService;
    public CatalogController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/search-by-params")
    public ResponseEntity<List<VariantCardDTO>> searchProductCardsByParams(
            @RequestParam MultiValueMap<String, String> params
    ) {
        List<VariantCardDTO> cards = productService.filterProductCardsByParams(params);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/search-by-url")
    public  ResponseEntity<List<VariantCardDTO>> searchProductCardsByUrl(
            @RequestParam("filtersUrl") String filtersUrl
    ){
        List<VariantCardDTO> cards = productService.filterProductCardsByUrl(filtersUrl);
        return ResponseEntity.ok(cards);
    }
}
