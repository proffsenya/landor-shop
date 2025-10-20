package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.User;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends Repository<User, Long> {
    User findById(Long id);
    User findByEmail(String email);
    List<User> findAll();
    List<User> byIsActive(Boolean isActive);
}