package com.example.backend.Application.Controllers.Products;

import com.example.backend.Domain.DTOs.*;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourseNotFoundException;
import com.example.backend.Infrastructure.Services.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Validated
class ProductController {
    private final ProductService productService;
    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

//    @GetMapping("/cards")
//    public ResponseEntity<List<ProductCardDTO>> getProductCard(
//            @RequestParam(required = false) Boolean active,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "20") int size
//    ) {
//        List<Product> products = active != null ?
//                productService.findByIsActive(active) :
//                productService.findAll();
//
//        List<ProductCardDTO> cards = products.stream()
//                .map(this::toProductCardDTO)
//                .toList();
//
//        return ResponseEntity.ok(cards);
//    }

    @GetMapping("/cards")
    public ResponseEntity<List<ProductCardDTO>> getProductCard(
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<ProductCardDTO> cards = productService.getProductCardsForFrontend(active);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ProductResponseDTO> getProductDetail(@PathVariable Long id) {
        Product product = productService.findById(id)
                .orElseThrow(()-> new ResourseNotFoundException("Product not found"));

        return ResponseEntity.ok(toProductResponseDTO(product));
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponseDTO> createProduct(
            @RequestPart("productDTO") @Valid CreateProductDTO productDTO,
            @RequestPart(value="images", required = false) List<MultipartFile> images) {

        try {
            Product product = productService.create(productDTO, images);
            return ResponseEntity.status(HttpStatus.CREATED).body(toProductResponseDTO(product));
        }
        catch (IOException e) {
            throw new InvalidRequestException("File upload failed");
        }
    }

//    @PreAuthorize("hasRole('STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProductDTO productDTO) {
        Product updatedProduct = productService.update(id, productDTO);
        ProductResponseDTO responseDTO = toProductResponseDTO(updatedProduct);
        return ResponseEntity.ok(responseDTO);
    }

//    @PreAuthorize("hasRole('STAFF')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> deleteProduct(
            @PathVariable Long id
    ){
        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ProductResponseDTO toProductResponseDTO(Product product) {
        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getFeedingNote(),
                product.getGuaranteedIndicators(),
                product.getSlug(),
                product.getIsActive(),
                product.getIsFeatured(),
                product.getRating(),


                product.getBreeds().stream().map(b -> new BreedDTO(b.getId(), b.getName(), b.getSlug(), b.getCategory().getId())).toList(),
                product.getCategories().stream().map(c -> new CategoryDTO(c.getId(), c.getName(), c.getSlug())).toList(),
                product.getCountries().stream().map(c -> new CountryDTO(c.getId(), c.getName(), c.getSlug())).toList(),
                product.getTypeoffoods().stream().map(t -> new TypeOfFoodDTO(t.getId(), t.getName(), t.getSlug())).toList(),

                product.getImages().stream()
                        .map(img -> new ProductImageDTO(
                                img.getId(),
                                img.getIsMain(),    // Boolean isMain - второй параметр
                                img.getAltText()    // String altText - третий параметр
                        ))
                        .toList(),
                product.getFlavors().stream().map(f ->
                        new FlavorDTO(f.getId(), f.getName(), f.getCanonicalName())).toList(),
                product.getProductVariants().stream().map(v ->new ResponseVariantDTO(
                                    v.getId(),
                                    product.getId(),
                                    v.getSku(),
                                    v.getPrice(),
                                    v.getOldPrice(),
                                    v.getStock(),
                                    v.getWeight(),
                                    v.getColors().stream().map(c -> new ColorDTO(c.getId(), c.getName(), c.getSlug())).toList(),
                                    v.getScents().stream().map(s -> new ScentDTO(s.getId(), s.getName(), s.getSlug())).toList(),
                                    v.getDisplayName()
                        )).toList(),
                product.getBrand() != null ? product.getBrand().getId() : null,
                product.getProductType() != null ? product.getProductType().getId() : null
        );
    }

//    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<ProductResponseDTO> createProduct(
//            @RequestBody @Valid CreateProductDTO productDTO) {
//
//        try {
//            Product product = productService.create(productDTO, null);
//            return ResponseEntity.status(HttpStatus.CREATED).body(toProductResponseDTO(product));
//        }
//        catch (IOException e) {
//            throw new InvalidRequestException("File upload failed");
//        }
//    }

}
