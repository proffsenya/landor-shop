package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
class UsersService {
    private UserRepository userRepository;
    public UsersService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findByIsActive(Boolean isActive) {
        return userRepository.findByIsActive(isActive);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }



}
