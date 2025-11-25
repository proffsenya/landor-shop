package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Breed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BreedRepository extends JpaRepository<Breed, Integer> {
    Optional<Breed> findByName(String name);
}