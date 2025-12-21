package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductVariant;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long>, JpaSpecificationExecutor<ProductVariant> {
    Optional<ProductVariant> findBySku(@Size(max = 120) String sku);
     @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select pv from ProductVariant pv where pv.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);

    // Оптимизированный EntityGraph для каталога - загружаем только необходимые данные
    @EntityGraph(attributePaths = {
            "product",
            "product.images",
            "product.images.productVariant"
            // Убираем загрузку фильтров, так как они не нужны для каталога
            // Они загружаются только если используются в фильтрах через Specification
    })
    @Override
    Page<ProductVariant> findAll(Specification<ProductVariant> spec, Pageable pageable);

    // Оптимизированный EntityGraph для каталога без фильтров
    @EntityGraph(attributePaths = {
            "product",
            "product.images",
            "product.images.productVariant"
    })
    Page<ProductVariant> findAll(Pageable pageable);

    // Для методов с фильтрами загружаем больше данных, так как они нужны для фильтрации
    @EntityGraph(attributePaths = {
            "product",
            "product.categories",
            "product.breeds",
            "product.countries",
            "product.typeoffoods",
            "product.flavors",
            "product.brand",
            "product.productType",
            "product.images",
            "product.images.productVariant",
            "colors",
            "scents"
    })
    List<ProductVariant> findAll(Specification<ProductVariant> spec, Sort sort);

    // Для методов с фильтрами загружаем больше данных
    @EntityGraph(attributePaths = {
            "product",
            "product.categories",
            "product.breeds",
            "product.countries",
            "product.typeoffoods",
            "product.flavors",
            "product.brand",
            "product.productType",
            "product.images",
            "product.images.productVariant",
            "colors",
            "scents"
    })
    List<ProductVariant> findAll(Specification<ProductVariant> spec);

}