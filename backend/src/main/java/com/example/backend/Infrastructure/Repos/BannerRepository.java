package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface BannerRepository extends JpaRepository<Banner, Long> {
}