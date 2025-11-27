package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface ColorRepository extends JpaRepository<Color, Long> {
    Optional<Color> findByName(String name);
}