package com.example.backend.Application.Controllers.UserAuth;

import com.example.backend.Domain.DTOs.AuthResponseDTO;
import com.example.backend.Domain.DTOs.LoginRequestDTO;
import com.example.backend.Domain.DTOs.RegisterRequestDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO request){
        AuthResponseDTO response = authService.Register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request){
        AuthResponseDTO response = authService.Login(request);
        return ResponseEntity.ok(response);
    }

}
