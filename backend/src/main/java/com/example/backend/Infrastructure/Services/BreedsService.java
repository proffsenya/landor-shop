package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.BreedCreateDTO;
import com.example.backend.Domain.DTOs.BreedDTO;
import com.example.backend.Domain.DTOs.CreateProductDTO;
import com.example.backend.Domain.Models.Breed;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.BreedRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class BreedsService {
    private final BreedRepository breedRepository;
    private final ProductRepository productRepository;
    public BreedsService(BreedRepository breedRepository,  ProductRepository productRepository) {
        this.breedRepository = breedRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void addBreed(Long productId, List<Integer> breedIds) {
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new InvalidRequestException("Product not found"));

        Set<Breed> breeds = new LinkedHashSet<>(breedRepository.findAllById(breedIds));
        product.getBreeds().addAll(breeds);
        productRepository.save(product);
    }

    @Transactional
    public void removeBreed(Long productId, List<Integer> breedIds) {
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new InvalidRequestException("Product not found"));
        product.getBreeds().removeIf(breed -> breedIds.contains(breed.getId()));
        productRepository.save(product);
    }

}
