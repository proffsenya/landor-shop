package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Cart;
import com.example.backend.Domain.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Cart findByUserId(Long userId);
    Optional<Cart> findByUser(User user);
}