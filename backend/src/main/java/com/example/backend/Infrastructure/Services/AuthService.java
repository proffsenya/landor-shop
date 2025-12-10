package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.AuthResponseDTO;
import com.example.backend.Domain.DTOs.LoginRequestDTO;
import com.example.backend.Domain.DTOs.RegisterRequestDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.*;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
public class AuthService {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JWTService  jwtService;
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,  JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO Login(LoginRequestDTO loginRequestDTO)
    {
        if (loginRequestDTO.email().isEmpty() || loginRequestDTO.passwordHash().isEmpty()) { throw new InvalidRequestException("Email or password hash is required"); }
        User user = userRepository.findByEmail(loginRequestDTO.email()).get();
        if (user == null || !passwordEncoder.matches(loginRequestDTO.passwordHash(), user.getPasswordHash())) {throw new InvalidResourseException("Email or password hash is empty");}
        if (user.getIsActive().equals(false)) {throw new AccountNotActiveException("Account is deactivated. Please contact support.");}

        String jwtToken = jwtService.generateToken(user);

        return new AuthResponseDTO(
                jwtToken,
                user.getEmail(),
                user.getIsStaff(),
                user.getIsSuperuser()
        );
    }

    public AuthResponseDTO Register(RegisterRequestDTO registerRequestDTO)
    {
        if(registerRequestDTO.email().isEmpty() || registerRequestDTO.passwordHash().isEmpty()) { throw new InvalidRequestException("Email or password hash is required"); }
        if(userRepository.findByEmail(registerRequestDTO.email()) != null) {throw new InvalidResourseException("User with this email already exists");}

        User newuser = new User();
        newuser.setEmail(registerRequestDTO.email());
        newuser.setPasswordHash(passwordEncoder.encode(registerRequestDTO.passwordHash()));
        newuser.setFirstName(registerRequestDTO.firstName());
        newuser.setLastName(registerRequestDTO.lastName());
        newuser.setCreatedAt(Instant.now());
        newuser.setIsStaff(false);
        newuser.setIsSuperuser(false);
        newuser.setIsActive(true);

        User saveuser = userRepository.save(newuser);
        String jwtToken = jwtService.generateToken(saveuser);

        return new AuthResponseDTO(
                jwtToken,
                newuser.getEmail(),
                newuser.getIsStaff(),
                newuser.getIsSuperuser()
        );
    }
}
