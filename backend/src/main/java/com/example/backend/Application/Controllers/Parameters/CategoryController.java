package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.CategoryCreateDTO;
import com.example.backend.Domain.DTOs.CategoryDTO;
import com.example.backend.Infrastructure.Services.CategoriesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/categories")
class CategoryController {
    private final CategoriesService categoriesService;
    public CategoryController(CategoriesService categoriesService){
        this.categoriesService = categoriesService;
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryCreateDTO dto){
        return ResponseEntity.ok().body(categoriesService.createCategory(dto));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories(){
        return ResponseEntity.ok().body(categoriesService.getAllCategories());
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryDTO> getCategory(@PathVariable Long categoryId){
        return ResponseEntity.ok().body(categoriesService.getCategoryById(categoryId));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategoryById(@PathVariable Long categoryId) {
        categoriesService.deleteCategoryById(categoryId);
        return ResponseEntity.noContent().build();
    }
}
