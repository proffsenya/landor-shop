package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.BreedCreateDTO;
import com.example.backend.Domain.DTOs.BreedDTO;
import com.example.backend.Domain.DTOs.CreateProductDTO;
import com.example.backend.Domain.Models.Breed;
import com.example.backend.Domain.Models.Category;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.BreedRepository;
import com.example.backend.Infrastructure.Repos.CategoryRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class BreedsService {
    private final BreedRepository breedRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public BreedsService(BreedRepository breedRepository, ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.breedRepository = breedRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
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

    @Transactional
    public BreedDTO createBreed(BreedCreateDTO breedCreateDTO) {
        if (breedCreateDTO == null ){
            throw new InvalidRequestException("BreedCreateDTO is null");
        }

        if (breedRepository.findByName(breedCreateDTO.name()).isPresent()){
            throw new InvalidRequestException("Breed with name already exists");
        }

        Category category = null;

        if (categoryRepository.findById(breedCreateDTO.categoryId()).isPresent()){
            category = categoryRepository.findById(breedCreateDTO.categoryId()).get();
        }

        Breed breed = new Breed();
        breed.setName(breedCreateDTO.name());
        breed.setSlug(breedCreateDTO.slug());
        breed.setCategory(category);

        Breed newbreed = breedRepository.save(breed);

        return new BreedDTO(
                newbreed.getId(),
                newbreed.getName(),
                newbreed.getSlug(),
                newbreed.getCategory().getId()
        );
    }

    @Transactional
    public BreedDTO getBreed(Integer id) {
        if (id == null || id < 0 || id >= breedRepository.findAll().size()) {
            throw new InvalidRequestException("Breed with id not found");
        }
        if (!breedRepository.findById(id).isPresent()) {
            throw new InvalidRequestException("Breed with id not found");
        }
        Breed currentBreed = breedRepository.findById(id).get();
        return new BreedDTO(
                currentBreed.getId(),
                currentBreed.getName(),
                currentBreed.getSlug(),
                currentBreed.getCategory().getId()
        );
    }

    @Transactional
    public List<BreedDTO> getAllBreeds() {
        List<Breed> allBreeds = breedRepository.findAll();
        List<BreedDTO> breedDTOS = new ArrayList<>();
        for (Breed breed : allBreeds) {
            BreedDTO dto = new BreedDTO(
                    breed.getId(),
                    breed.getName(),
                    breed.getSlug(),
                    breed.getCategory().getId()
            );
            breedDTOS.add(dto);
        }
        return breedDTOS;
    }

    @Transactional
    public void deleteBreedById(Integer id) {
        if (breedRepository.existsById(id)) {
            breedRepository.deleteById(id);
        }
    }
}
