package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductVariant;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findBySku(@Size(max = 120) String sku);
    List<ProductVariant> findAll(Specification<ProductVariant> spec, Sort sort);
}