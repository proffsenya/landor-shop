package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.AuthResponseDTO;
import com.example.backend.Domain.DTOs.LoginRequestDTO;
import com.example.backend.Domain.DTOs.RegisterRequestDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.*;
import com.example.backend.Infrastructure.Repos.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
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

    @Transactional
    public AuthResponseDTO Login(LoginRequestDTO loginRequestDTO)
    {
        if (loginRequestDTO.email().isEmpty() || loginRequestDTO.passwordHash().isEmpty()) { throw new InvalidRequestException("Email or password hash is required"); }
        Optional<User> maybeUser = userRepository.findByEmail(loginRequestDTO.email());
        if (maybeUser.isEmpty()) {
            throw new InvalidResourseException("Invalid email or password");
        }

        User user = maybeUser.get();

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

    @Transactional
    public AuthResponseDTO Register(RegisterRequestDTO registerRequestDTO)
    {
//        if(registerRequestDTO.email().isEmpty() || registerRequestDTO.passwordHash().isEmpty()) { throw new InvalidRequestException("Email or password hash is required"); }
//
//        Optional<User> existing = userRepository.findByEmail(registerRequestDTO.email());
//        if (existing.isPresent()) {
//            throw new InvalidResourseException("User with this email already exists");
//        }

        log.info("Register attempt for email: {}", registerRequestDTO.email());

        String email = registerRequestDTO.email().toLowerCase().trim();
        log.debug("Normalized email: {}", email);

        Optional<User> existing = userRepository.findByEmail(email);
        log.debug("User found: {}", existing.isPresent());

        if (existing.isPresent()) {
            User user = existing.get();
            log.warn("Existing user found - ID: {}, Email: {}, Created: {}",
                    user.getId(), user.getEmail(), user.getCreatedAt());
            throw new InvalidResourseException("User with this email already exists");
        }

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
