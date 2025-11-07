package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface ColorRepository extends JpaRepository<Color, Long> {
}