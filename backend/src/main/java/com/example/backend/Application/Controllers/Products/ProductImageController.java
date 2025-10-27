package com.example.backend.Application.Controllers.Products;

import com.example.backend.Domain.DTOs.ProductImageDTO;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductImage;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourseNotFoundException;
import com.example.backend.Infrastructure.Repos.ProductImageRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import com.example.backend.Infrastructure.Services.ProductImagesService;
import com.example.backend.Infrastructure.Services.ProductService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productID}/images")
class ProductImageController {
    private final ProductService productService;
    private final ProductImagesService productImagesService;
    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;


    ProductImageController(ProductService productService, ProductImageRepository productImageRepository, ProductImagesService productImagesService, ProductRepository productRepository) {
        this.productService = productService;
        this.productImageRepository = productImageRepository;
        this.productImagesService = productImagesService;
        this.productRepository = productRepository;
    }

//    @PreAuthorize("hasRole('STAFF')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ProductImageDTO>> addImagesToProduct(@PathVariable Long productID, @RequestParam("file") List<MultipartFile> file){
        try {
            Product product = productRepository.findById(productID).orElseThrow(()-> new ResourseNotFoundException("Product not found"));
            productImagesService.addImagesToProduct(product, file);
            List<ProductImageDTO> productImageDTOS = product.getImages()
                    .stream()
                    .map(this::toProductImageDTO)
                    .toList();
            return ResponseEntity.ok(productImageDTOS);
        }
        catch (IOException e) {
            throw new InvalidRequestException("File processing error");
        }
    }

    @GetMapping
    public ResponseEntity<List<ProductImageDTO>> getProductImageById(@PathVariable Long productID){
        List<ProductImage> productImages = new ArrayList<>();
        productImages = productImagesService.getProductImagesById(productID);
        List<ProductImageDTO> productImageDTOS = productImages.stream()
                .map(this::toProductImageDTO)
                .toList();
        return ResponseEntity.ok(productImageDTOS);
    }

    public ProductImageDTO toProductImageDTO(ProductImage productImage){
        if(productImage != null){
            return new ProductImageDTO(productImage.getId(), productImage.getIsMain(), productImage.getAltText());}
        else {throw new InvalidRequestException("Product image not found");}
    }

}
