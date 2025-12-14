package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.CategoryCreateDTO;
import com.example.backend.Domain.DTOs.CategoryDTO;
import com.example.backend.Domain.Models.Category;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.CategoryRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class CategoriesService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    public CategoriesService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public void removeCategories(Long productId, List<Integer> categoryIds){
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidRequestException("Product not found"));
        product.getCategories().removeIf(category -> category.getCategories().contains(category.getId()));
        productRepository.save(product);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryCreateDTO dto) {
        if (dto == null){
            throw new InvalidRequestException("CategoryCreateDTO is null");
        }
        if (categoryRepository.findByName(dto.name()).isPresent()){
            throw new InvalidRequestException("Category already exists");
        }
        Category category = new Category();
        category.setName(dto.name());
        category.setDescription(dto.description());
        category.setSlug(dto.slug());

        Category newCategory = categoryRepository.save(category);
        return new CategoryDTO(
                newCategory.getId(),
                newCategory.getName(),
                newCategory.getSlug()
        );
    }

    @Transactional
    public CategoryDTO getCategoryById(Long id) {
        if (id == null || id <= 0 || !categoryRepository.findById(id).isPresent()){
            throw new InvalidRequestException("Category not found");
        }
        Category category = categoryRepository.findById(id).get();
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getSlug()
        );
    }

    @Transactional
    public List<CategoryDTO> getAllCategories(){
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDTO> categoryDTOS = new ArrayList<>();
        for (Category category : categories){
            categoryDTOS.add(new CategoryDTO(category.getId(), category.getName(), category.getSlug()));
        }
        return categoryDTOS;
    }

    @Transactional
    public void deleteCategoryById(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
        }
    }


}
