package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Category;
import com.example.backend.Domain.Models.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Collection;
import java.util.List;

public interface CountryRepository extends JpaRepository<Country, Integer> {
}