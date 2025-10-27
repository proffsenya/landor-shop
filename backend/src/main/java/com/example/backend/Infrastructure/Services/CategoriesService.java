package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.Category;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.CategoryRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
class CategoriesService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    public CategoriesService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public void addCategories(Long productId, List<Integer> categoryIds){
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidRequestException("Product not found"));

        Set<Category> categories = new LinkedHashSet<>(categoryRepository.findAllById(categoryIds));
        product.getCategories().addAll(categories);
        productRepository.save(product);
    }

    @Transactional
    public void removeCategories(Long productId, List<Integer> categoryIds){
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidRequestException("Product not found"));
        product.getCategories().removeIf(category -> category.getCategories().contains(category.getId()));
        productRepository.save(product);
    }

}
