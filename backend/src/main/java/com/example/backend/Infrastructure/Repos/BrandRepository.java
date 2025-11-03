package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}