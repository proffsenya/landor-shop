package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.Typeoffood;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import com.example.backend.Infrastructure.Repos.TypeoffoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
class TypesOfFoodService {
    private final TypeoffoodRepository typeoffoodRepository;
    private final ProductRepository productRepository;
    public TypesOfFoodService(TypeoffoodRepository typeoffoodRepository, ProductRepository productRepository) {
        this.typeoffoodRepository = typeoffoodRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void addType(Long productId, List<Integer> typesIds) {
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new InvalidRequestException("Product not found"));

        Set<Typeoffood> types = new LinkedHashSet<>(typeoffoodRepository.findAllById(typesIds));
        product.getTypeoffoods().addAll(types);
        productRepository.save(product);
    }

    @Transactional
    public void removeType(Long productId, List<Integer> typesIds) {
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new InvalidRequestException("Product not found"));
        product.getTypeoffoods().removeIf(type -> typesIds.contains(type.getId()));
        productRepository.save(product);
    }
}
