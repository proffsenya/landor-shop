package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
}