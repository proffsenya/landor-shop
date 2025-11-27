package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Category;
import com.example.backend.Domain.Models.Typeoffood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TypeoffoodRepository extends JpaRepository<Typeoffood, Integer> {
    Optional<Typeoffood> findByName(String name);
}