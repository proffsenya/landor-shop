package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.LongSummaryStatistics;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}