package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Flavor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface FlavorRepository extends JpaRepository<Flavor, Long> {
    Optional<Flavor> findByCanonicalName(String canonical);
    Optional<Flavor> findByName(String name);
}