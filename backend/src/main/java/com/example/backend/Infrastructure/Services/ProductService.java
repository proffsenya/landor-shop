package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.CreateProductDTO;
import com.example.backend.Domain.DTOs.UpdateProductDTO;
import com.example.backend.Domain.DTOs.VariantDTO;
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
    private final BrandRepository  brandRepository;
    private final FlavorRepository  flavorRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductVariantRepository productVariantRepository;
    private static final String FLAVOR_SPLIT_REGEX = "\\s*(?:\\+|,|/|\\band\\b|\\bи\\b|\\bс\\b)\\s*"; // разделители
    @Autowired
    public ProductService(ProductRepository productRepository, ProductImageRepository productImageRepository,
                          BreedRepository breedRepository,
                          CategoryRepository categoryRepository,
                          CountryRepository  countryRepository,
                          TypeoffoodRepository  typeoffoodRepository,
                          BreedsService breedsService,
                          ProductImagesService productImagesService,
                          BrandRepository  brandRepository,
                          FlavorRepository  flavorRepository,
                          ProductTypeRepository productTypeRepository,
                          ProductVariantRepository productVariantRepository
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.breedRepository = breedRepository;
        this.categoryRepository = categoryRepository;
        this.countryRepository = countryRepository;
        this.typeoffoodRepository = typeoffoodRepository;
        this.breedsService = breedsService;
        this.productImagesService = productImagesService;
        this.brandRepository = brandRepository;
        this.flavorRepository = flavorRepository;
        this.productTypeRepository = productTypeRepository;
        this.productVariantRepository = productVariantRepository;
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

        Map<Long, ProductVariant> existingById = new HashMap<>();
        Map<String, ProductVariant> existingBySku = new HashMap<>();
        for (ProductVariant pv : currentproduct.getProductVariants()) {
            if (pv.getId() != null) existingById.put(pv.getId(), pv);
            if (pv.getSku() != null) existingBySku.put(pv.getSku(), pv);
        }

        Set<ProductVariant> updatedVariants = new LinkedHashSet<>();

        if (updatedproduct.variants() != null) {
            for (VariantDTO vDto : updatedproduct.variants()) {
                ProductVariant variant = null;

                if (vDto.id() != null) {
                    variant = existingById.remove(vDto.id());
                }

                if (variant == null && vDto.sku() != null && !vDto.sku().isBlank()) {
                    variant = existingBySku.get(vDto.sku());
                    if (variant != null) {
                        if (variant.getId() != null) existingById.remove(variant.getId());
                        existingBySku.remove(vDto.sku());
                    }
                }

                if (variant == null) {
                    if (vDto.sku() != null && !vDto.sku().isBlank()) {
                        Optional<ProductVariant> other = productVariantRepository.findBySku(vDto.sku());
                        if (other.isPresent()) {
                            if (other.get().getProduct() == null || !other.get().getProduct().getId().equals(currentproduct.getId())) {
                                throw new ResourceAlreadyExistsException("SKU " + vDto.sku() + " is already used by another variant");
                            } else {
                                variant = other.get();
                            }
                        }
                    }
                }

                if (variant == null) {variant = new ProductVariant();}
                variant.setProduct(currentproduct);
                variant.setSku(vDto.sku());
                variant.setPrice(vDto.price());
                variant.setOldPrice(vDto.oldPrice());
                variant.setStock(vDto.stock());
                variant.setWeight(vDto.weight());

                variant.setDisplayName(buildDisplayName(currentproduct, variant));

                updatedVariants.add(variant);
            }
        }

        if (!existingById.isEmpty()) {
            for (ProductVariant toRemove : existingById.values()) {
                currentproduct.getProductVariants().remove(toRemove);
            }
        }

        currentproduct.setName(updatedproduct.name());
        currentproduct.setDescription(updatedproduct.description());
        currentproduct.setSlug(updatedproduct.slug());
        currentproduct.setIsActive(updatedproduct.isActive());
        currentproduct.setRating(updatedproduct.rating());
        currentproduct.setQuantityInStock(updatedproduct.quantityInStock());
        currentproduct.setIsFeatured(updatedproduct.isFeatured());
        currentproduct.setBrand(brandRepository.findById(updatedproduct.brandId()).orElse(null));
        currentproduct.setProductType(productTypeRepository.findById(updatedproduct.productTypeId()).orElse(null));
        applyRelationshipsFromUpdateDto(currentproduct, updatedproduct);
        currentproduct.setProductVariants(updatedVariants);

        return productRepository.save(currentproduct);
    }

    @Transactional
    public Product create(CreateProductDTO createProductDTO, List<MultipartFile> files) throws IOException {
        if (createProductDTO == null) {
            throw new InvalidRequestException("Product is null");
        }
        Product product = new Product();
        product.setName(createProductDTO.name());
        product.setDescription(createProductDTO.description());
        product.setSlug(createProductDTO.slug());
        product.setQuantityInStock(createProductDTO.quantityInStock());
        product.setIsActive(true);
        product.setIsFeatured(false);
        product.setBrand(brandRepository.findById(createProductDTO.brandId()).orElse(null));
        product.setProductType(productTypeRepository.findById(createProductDTO.productTypeId()).orElse(null));

        processProductRelationships(product, createProductDTO);
        setProductVariants(product, createProductDTO);

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

        if (dto.flavorIds() != null && !dto.flavorIds().isEmpty()) {
            Set<Flavor> flavors = new LinkedHashSet<>(flavorRepository.findAllById(dto.flavorIds()));
            product.setFlavors(flavors);
        }
    }

    private void applyRelationshipsFromUpdateDto(Product product, UpdateProductDTO dto) {
        if (dto.breedIds() != null) {
            Set<Breed> breeds = new LinkedHashSet<>(breedRepository.findAllById(dto.breedIds()));
            product.setBreeds(breeds);
        }
        if (dto.categoryIds() != null) {
            Set<Category> categories = new LinkedHashSet<>(categoryRepository.findAllById(dto.categoryIds()));
            product.setCategories(categories);
        }
        if (dto.countryIds() != null) {
            Set<Country> countries = new LinkedHashSet<>(countryRepository.findAllById(dto.countryIds()));
            product.setCountries(countries);
        }
        if (dto.typeoffoodIds() != null) {
            Set<Typeoffood> typeoffoods = new LinkedHashSet<>(typeoffoodRepository.findAllById(dto.typeoffoodIds()));
            product.setTypeoffoods(typeoffoods);
        }
        if (dto.flavorIds() != null) {
            Set<Flavor> flavors = new LinkedHashSet<>(flavorRepository.findAllById(dto.flavorIds()));
            product.setFlavors(flavors);
        }
    }

    private void setProductVariants(Product product, CreateProductDTO dto) {
        Set<ProductVariant> productVariants = new LinkedHashSet<>();
        for (VariantDTO v : dto.variants()){
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSku(v.sku());
            variant.setPrice(v.price());
            variant.setStock(v.stock());
            variant.setWeight(v.weight());
            variant.setDisplayName(buildDisplayName(product, variant));

            productVariants.add(variant);
        }
        product.setProductVariants(productVariants);
    }

    private List<String> splitFlavorAtoms(String raw) {
        if (raw == null) return List.of();
        String cleaned = raw.trim();
        String[] parts = cleaned.split(FLAVOR_SPLIT_REGEX);
        List<String> atoms = new ArrayList<>();
        for (String p : parts) {
            p = p.trim();
            if (!p.isEmpty()) atoms.add(p);
        }
        return atoms;
    }

    private String canonicalize(String s) {
        if (s == null) return null;
        return s.toLowerCase()
                .replaceAll("[^\\p{L}\\p{Nd}]+", " ") // оставить буквы и цифры
                .trim()
                .replaceAll("\\s+", " ");
    }

    private Flavor findOrCreateFlavorByName(String rawName) {
        String canonical = canonicalize(rawName);
        return flavorRepository.findByCanonicalName(canonical)
                .orElseGet(() -> {
                    Flavor f = new Flavor();
                    f.setName(rawName.trim());
                    f.setCanonicalName(canonical);
                    return flavorRepository.save(f);
                });
    }

    private String joinFlavorNames(ProductVariant variant, Product product) {
        List<String> names = new ArrayList<>();
        if (product.getFlavors() != null && !product.getFlavors().isEmpty()) {
            product.getFlavors().forEach(f -> names.add(f.getName()));
        }
        return names.isEmpty() ? null : String.join(" + ", names);
    }

    private String buildDisplayName(Product product, ProductVariant variant) {
        StringBuilder sb = new StringBuilder();

        if (product.getBrand() != null && product.getBrand().getName() != null) {
            sb.append(product.getBrand().getName()).append(" ");
        }

        if (product.getName() != null) {
            sb.append(product.getName());
        }

        String flavorPart = joinFlavorNames(variant, product);
        if (flavorPart != null && !flavorPart.isBlank()) {
            sb.append(", ").append(flavorPart);
        }

        return sb.toString().trim();
    }
}
