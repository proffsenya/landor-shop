package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Scent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface ScentRepository extends JpaRepository<Scent, Long> {
}