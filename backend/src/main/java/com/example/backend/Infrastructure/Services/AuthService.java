package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.AuthResponseDTO;
import com.example.backend.Domain.DTOs.LoginRequestDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
class AuthService {
    private UserRepository userRepository;
    private AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponseDTO Login(LoginRequestDTO loginRequestDTO)
    {
        if (loginRequestDTO.email().isEmpty() || loginRequestDTO.passwordHash().isEmpty()) {return null;}
        User user = userRepository.findByEmail(loginRequestDTO.email());
        if (user == null) {return null;}
        if (!loginRequestDTO.passwordHash().equals(user.passwordHash())) {return null;}
        if (user.getIsActive().equals(false)) {return null;}

        return new AuthResponseDTO(
                "token",
                user.getEmail(),
                user.getIsStaff(),
                user.getIsSuperuser()
        );
    }
}
