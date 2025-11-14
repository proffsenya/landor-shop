package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.ProductImageDTO;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductImage;
import com.example.backend.Domain.Models.ProductVariant;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.ProductImageRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import com.example.backend.Infrastructure.Repos.ProductVariantRepository;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductImagesService {
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    public ProductImagesService(ProductRepository productRepository, ProductImageRepository productImageRepository,  ProductVariantRepository productVariantRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional
    public List<ProductImage> getProductImagesById(Long productId) {
        if (productRepository.findById(productId).isPresent()) {
            List<ProductImage> productImages = productRepository.findById(productId).get().getImages().stream().toList();
            return productImages;
        }
        else  {
            throw new InvalidRequestException("Product not found");
        }
    }

//    @Transactional
//    public List<ProductImage> addImagesToProduct(Long productId, List<ProductImage> productImages) {
//        Optional<Product> product = productRepository.findById(productId);
//        if (!product.isPresent()) {
//            throw new InvalidRequestException("Product not found");
//        }
//        for (ProductImage productImage : productImages) {
//            productImage.setProduct(productRepository.findById(productId).get());
//            product.get().getImages().add(productImage);
//        }
//        productRepository.save(product.get());
//        return productImages;
//    }

    @Transactional
    public void addImagesToProduct(Product product, List<MultipartFile> files, Long variantId) throws IOException {
        if (product == null) throw new InvalidRequestException("Product is empty");
        if (files == null || files.isEmpty()) throw new InvalidRequestException("Files is empty");

        List<ProductVariant> variants = new ArrayList<>(product.getProductVariants());

        boolean productMain = product.getImages().stream().anyMatch(img -> Boolean.TRUE.equals(img.getIsMain()));
        boolean first = true;

        if (!variants.isEmpty() && files.size() == variants.size()) {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file == null || file.isEmpty()) continue;
                ProductVariant targetVariant = variants.get(i);
                setAndAttach(targetVariant, file, product, !productMain && first);
            }
        }
    }

    @Transactional
    public void setAndAttach(ProductVariant linkedVariant, MultipartFile file, Product product, boolean setIsMain) throws IOException {
        String ct = file.getContentType();
                boolean ok = false;
                if (ct != null) ok = ct.toLowerCase().startsWith("image/");
                if (!ok) {
                    String filename = file.getOriginalFilename();
                    if (filename != null) {
                        String lower = filename.toLowerCase();
                        ok = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
                    }
                }
                if (!ok) throw new InvalidRequestException("Unsupported file type: " + ct + " filename=" + file.getOriginalFilename());

                long maxBytes = 2 * 1024 * 1024;
                if (file.getSize() > maxBytes) throw new InvalidRequestException("File too large: " + file.getOriginalFilename());

                ProductImage img = new ProductImage();
                img.setFileName(file.getOriginalFilename());
                img.setContentType(ct);
                img.setSize(file.getSize());
                img.setIsMain(setIsMain);
                img.setAltText(product.getName());
                img.setProduct(product);
                img.setData(file.getBytes());

                if (linkedVariant != null) {
                    img.setProductVariant(linkedVariant);
                }

                productImageRepository.save(img);
                product.getImages().add(img);

    }

    @Transactional
    public void addImagesToProduct(Product product, List<MultipartFile> files) throws IOException {
        addImagesToProduct(product, files, null);
    }
//
//    @Transactional
//    public void addImagesToProduct(Product product, List<MultipartFile> files) throws IOException {
//        if (product == null) {throw new InvalidRequestException("Product is empty");}
//        boolean hasMain = product.getImages().stream().anyMatch(img -> Boolean.TRUE.equals(img.getIsMain()));
//
//        boolean first = true;
//        if (files != null) {
//            for (MultipartFile file : files) {
//                if (file == null || file.isEmpty()) continue;
//                System.out.println("Incoming file: name=" + file.getOriginalFilename() + " size=" + file.getSize() + " ct=" + file.getContentType());
//                String ct = file.getContentType();
//                boolean ok = false;
//                if (ct != null) {
//                    ok = ct.toLowerCase().startsWith("image/");
//                }
//                if (!ok) {
//                    String filename = file.getOriginalFilename();
//                    if (filename != null) {
//                        String lower = filename.toLowerCase();
//                        ok = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
//                    }
//                }
//                if (!ok) {
//                    throw new InvalidRequestException("Unsupported file type: " + ct + " filename=" + file.getOriginalFilename());
//                }
//                long maxBytes = 2 * 1024 * 1024; // 2MB limit
//                if (file.getSize() > maxBytes) {
//                    throw new InvalidRequestException("File too large: " + file.getOriginalFilename());
//                }
//
//                ProductImage img = new ProductImage();
//                img.setFileName(file.getOriginalFilename());
//                img.setContentType(ct);
//                img.setSize(file.getSize());
//                img.setIsMain(!hasMain && first);
//                img.setAltText(product.getName());
//                img.setProduct(product);
//                img.setData(file.getBytes());
//
//                System.out.println(">>> IMG BEFORE SAVE: fileName=" + img.getFileName()
//                        + " contentType=" + img.getContentType()
//                        + " size=" + img.getSize()
//                        + " productId=" + (img.getProduct() != null ? img.getProduct().getId() : "null")
//                        + " dataClass=" + (img.getData() == null ? "null" : img.getData().getClass().getName())
//                        + " dataLen=" + (img.getData() == null ? "null" : img.getData().length));
//                System.out.println("SET PRODUCT: product.getId()=" + product.getId());
//
//                product.addImage(img);
//                first = false;
//            }
//        }
//    }

}
