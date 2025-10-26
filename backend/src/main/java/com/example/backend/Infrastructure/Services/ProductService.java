package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.CreateProductDTO;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductImage;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourceAlreadyExistsException;
import com.example.backend.Infrastructure.Repos.ProductImageRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    @Autowired
    public ProductService(ProductRepository productRepository, ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(long id) {
        return productRepository.findById(id);
    }

    public List<Product> findByIsActive(Boolean isActive) {
        return productRepository.findByIsActive(isActive);
    }

    @Transactional
    public Product update(Product updatedproduct) {
        Product currentproduct = productRepository.findById(updatedproduct.getId())
                .orElseThrow(() -> new InvalidRequestException("Product with id " + updatedproduct.getId() + " does not exist"));

        if (updatedproduct.getSku() != null && !updatedproduct.getSku().equals(currentproduct.getSku())) {
            productRepository.findBySku(updatedproduct.getSku()).ifPresent(p -> {
                if (!p.getId().equals(currentproduct.getId())) {
                    throw new ResourceAlreadyExistsException("SKU already used by another product");
                }
            });
        }
        currentproduct.setName(updatedproduct.getName());
        currentproduct.setPrice(updatedproduct.getPrice());
        currentproduct.setDescription(updatedproduct.getDescription());
        currentproduct.setSlug(updatedproduct.getSlug());
        currentproduct.setIsActive(updatedproduct.getIsActive());
        currentproduct.setSku(updatedproduct.getSku());
        currentproduct.setRating(updatedproduct.getRating());
        currentproduct.setQuantityInStock(updatedproduct.getQuantityInStock());
        currentproduct.setIsFeatured(updatedproduct.getIsFeatured());

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

        boolean first = true;
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;

                String ct = file.getContentType();
                if (ct == null || (!ct.equals("image/jpeg") && !ct.equals("image/png") && !ct.equals("image/webp"))) {
                    throw new InvalidRequestException("Unsupported file type: " + ct);
                }
                long maxBytes = 2 * 1024 * 1024; // 2MB limit
                if (file.getSize() > maxBytes) {
                    throw new InvalidRequestException("File too large: " + file.getOriginalFilename());
                }

                ProductImage img = new ProductImage();
//                img.setFileName(file.getOriginalFilename());
//                img.setContentType(ct);
//                img.setSize(file.getSize());
                img.setIsMain(first);
                img.setAltText(createProductDTO.name());
                img.setProduct(product);
                img.setData(file.getBytes());

                product.addImage(img);
                first = false;
            }
        }


        return productRepository.save(product);
    }

    @Transactional
    public void deleteById(long id) {
        if (!productRepository.findById(id).isPresent())
        {throw new InvalidRequestException("Product with id " + id + " does not exist");}
        productRepository.deleteById(id);
    }

}
