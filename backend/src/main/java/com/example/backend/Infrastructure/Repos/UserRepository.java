package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.DTOs.UserProfileDTO;
import com.example.backend.Domain.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    List<User> findByIsActive(Boolean isActive);
    User save(User user);

}