package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Collection;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}