package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Product;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findById(Long id);
    List<Product> findAll();
    Product save(Product product);
    List<Product> findByIsActive(Boolean isActive);
    void deleteById(Long id);
    @EntityGraph(attributePaths = {"images", "images.productVariant", "productVariants"})
    List<Product> findAll(Specification<Product> spec, Sort sort);
}