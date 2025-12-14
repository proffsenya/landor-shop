package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Favorite;
import com.example.backend.Domain.Models.ProductVariant;
import com.example.backend.Domain.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserAndProductVariant(User user, ProductVariant productVariant);
    Optional<Favorite> findByUserAndProductVariant(User user, ProductVariant productVariant);
    void deleteByUserAndProductVariant(User user, ProductVariant productVariant);
    List<Favorite> findAllByUser(User user);
    void deleteAllByUser(User user);
    void deleteAllByUserAndProductVariantIdIn(User user, List<Long> moved);
}