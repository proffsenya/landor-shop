package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.CreateProductDTO;
import com.example.backend.Domain.DTOs.UpdateProductDTO;
import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourceAlreadyExistsException;
import com.example.backend.Infrastructure.Repos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class ProductService {
    private ProductImagesService productImagesService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final BreedRepository breedRepository;
    private final BreedsService breedsService;
    private final CategoryRepository categoryRepository;
    private final CountryRepository  countryRepository;
    private final TypeoffoodRepository  typeoffoodRepository;
    @Autowired
    public ProductService(ProductRepository productRepository, ProductImageRepository productImageRepository,
                          BreedRepository breedRepository,
                          CategoryRepository categoryRepository,
                          CountryRepository  countryRepository,
                          TypeoffoodRepository  typeoffoodRepository,
                          BreedsService breedsService,
                          ProductImagesService productImagesService
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.breedRepository = breedRepository;
        this.categoryRepository = categoryRepository;
        this.countryRepository = countryRepository;
        this.typeoffoodRepository = typeoffoodRepository;
        this.breedsService = breedsService;
        this.productImagesService = productImagesService;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(long id) {
        if (productRepository.findById(id).isPresent()) {return productRepository.findById(id);}
        else {throw new InvalidRequestException("Product not found");}
    }

    public List<Product> findByIsActive(Boolean isActive) {
        return productRepository.findByIsActive(isActive);
    }

    @Transactional
    public Product update(Long id, UpdateProductDTO updatedproduct) {
        Product currentproduct = productRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Product with id " + id + " does not exist"));

        if (updatedproduct.sku() != null && !updatedproduct.sku().equals(currentproduct.getSku())) {
            productRepository.findBySku(updatedproduct.sku()).ifPresent(p -> {
                if (!p.getId().equals(currentproduct.getId())) {
                    throw new ResourceAlreadyExistsException("SKU already used by another product");
                }
            });
        }
        currentproduct.setName(updatedproduct.name());
        currentproduct.setPrice(updatedproduct.price());
        currentproduct.setDescription(updatedproduct.description());
        currentproduct.setSlug(updatedproduct.slug());
        currentproduct.setIsActive(updatedproduct.isActive());
        currentproduct.setSku(updatedproduct.sku());
        currentproduct.setRating(updatedproduct.rating());
        currentproduct.setQuantityInStock(updatedproduct.quantityInStock());
        currentproduct.setIsFeatured(updatedproduct.isFeatured());

        return productRepository.save(currentproduct);
    }

    @Transactional
    public Product create(CreateProductDTO createProductDTO, List<MultipartFile> files) throws IOException {
        if (createProductDTO == null) {
            throw new InvalidRequestException("Product is null");
        }
        if (productRepository.findBySku(createProductDTO.sku()).isPresent()) {
            throw new ResourceAlreadyExistsException("Product with sku " + createProductDTO.sku() + " already exists");
        }
        Product product = new Product();
        product.setName(createProductDTO.name());
        product.setPrice(createProductDTO.price());
        product.setDescription(createProductDTO.description());
        product.setSlug(createProductDTO.slug());
        product.setQuantityInStock(createProductDTO.quantityInStock());
        product.setIsActive(true);
        product.setIsFeatured(false);
        product.setSku(createProductDTO.sku());

        processProductRelationships(product, createProductDTO);

        productImagesService.addImagesToProduct(product, files);

        return productRepository.save(product);
    }

    @Transactional
    public void deleteById(long id) {
        if (!productRepository.findById(id).isPresent())
        {throw new InvalidRequestException("Product with id " + id + " does not exist");}
        productRepository.deleteById(id);
    }

    private void processProductRelationships(Product product, CreateProductDTO dto) {
        if (dto.breedIds() != null && !dto.breedIds().isEmpty()) {
            Set<Breed> breeds = new LinkedHashSet<>(breedRepository.findAllById(dto.breedIds()));
            product.setBreeds(breeds);
        }

        if (dto.categoryIds() != null && !dto.categoryIds().isEmpty()) {
            Set<Category> categories = new LinkedHashSet<>(categoryRepository.findAllById(dto.categoryIds()));
            product.setCategories(categories);
        }

        if (dto.countryIds() != null && !dto.countryIds().isEmpty()) {
            Set<Country> countries = new LinkedHashSet<>(countryRepository.findAllById(dto.countryIds()));
            product.setCountries(countries);
        }

        if (dto.typeoffoodIds() != null && !dto.typeoffoodIds().isEmpty()) {
            Set<Typeoffood> typeoffoods = new LinkedHashSet<>(typeoffoodRepository.findAllById(dto.typeoffoodIds()));
            product.setTypeoffoods(typeoffoods);
        }
    }
}
