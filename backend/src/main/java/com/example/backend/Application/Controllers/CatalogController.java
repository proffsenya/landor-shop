package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.ProductCardDTO;
import com.example.backend.Domain.DTOs.VariantCardDTO;
import com.example.backend.Infrastructure.Services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<Page<VariantCardDTO>> searchProductCardsByUrl(
            @RequestParam("filtersUrl") String filtersUrl, @PageableDefault(size = 24, sort = "id",
                    direction = Sort.Direction.DESC) Pageable pageable
    ){
        Page<VariantCardDTO> cards = productService.filterProductCardsByUrl(filtersUrl, pageable);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<VariantCardDTO>> searchProductCards(
            @RequestParam("q") String query,
            @PageableDefault(size = 15, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<VariantCardDTO> cards = productService.searchProductCardsByText(query, pageable);
        return ResponseEntity.ok(cards);
    }
}
