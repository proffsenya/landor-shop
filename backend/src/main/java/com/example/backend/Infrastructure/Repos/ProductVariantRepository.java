package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductVariant;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findBySku(@Size(max = 120) String sku);
    List<ProductVariant> findAll(Specification<ProductVariant> spec, Sort sort);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select pv from ProductVariant pv where pv.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);
}