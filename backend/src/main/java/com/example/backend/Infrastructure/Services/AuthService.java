package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.AuthResponseDTO;
import com.example.backend.Domain.DTOs.LoginRequestDTO;
import com.example.backend.Domain.DTOs.RegisterRequestDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.InvalidResourseException;
import com.example.backend.Infrastructure.Exceptions.ResourseNotFoundException;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
class AuthService {
    private UserRepository userRepository;
    private AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponseDTO Login(LoginRequestDTO loginRequestDTO)
    {
        if (loginRequestDTO.email().isEmpty() || loginRequestDTO.passwordHash().isEmpty()) { throw new ResourseNotFoundException("Email or password hash is required"); }
        User user = userRepository.findByEmail(loginRequestDTO.email());
        if (user == null || !loginRequestDTO.passwordHash().equals(user.getPasswordHash())) {throw new InvalidResourseException("Email or password hash is empty");}
        if (user.getIsActive().equals(false)) {throw new ResourseNotFoundException("Account is deactivated. Please contact support.");}

        return new AuthResponseDTO(
                "token",
                user.getEmail(),
                user.getIsStaff(),
                user.getIsSuperuser()
        );
    }

    public AuthResponseDTO Register(RegisterRequestDTO registerRequestDTO)
    {
        if(registerRequestDTO.email().isEmpty() || registerRequestDTO.passwordHash().isEmpty()) { throw new ResourseNotFoundException("Email or password hash is required"); }
        if(userRepository.findByEmail(registerRequestDTO.email()) != null) {throw new InvalidResourseException("User with this email already exists");}

        User newuser = new User();
        newuser.setEmail(registerRequestDTO.email());
        newuser.setPasswordHash(registerRequestDTO.passwordHash());
        newuser.setFirstName(registerRequestDTO.firstName());
        newuser.setLastName(registerRequestDTO.lastName());
        newuser.setCreatedAt(Instant.now());
        newuser.setIsStaff(false);
        newuser.setIsSuperuser(false);
        newuser.setIsActive(true);

        User saveuser = userRepository.save(newuser);
        return new AuthResponseDTO(
                "token",
                newuser.getEmail(),
                newuser.getIsStaff(),
                newuser.getIsSuperuser()
        );
    }
}
