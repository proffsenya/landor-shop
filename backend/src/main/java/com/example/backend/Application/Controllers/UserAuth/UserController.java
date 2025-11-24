package com.example.backend.Application.Controllers.UserAuth;

import com.example.backend.Domain.DTOs.ChangePasswodDTO;
import com.example.backend.Domain.DTOs.UserProfileDTO;
import com.example.backend.Domain.DTOs.UserUpdateDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Repos.UserRepository;
import com.example.backend.Infrastructure.Services.JWTService;
import com.example.backend.Infrastructure.Services.UsersService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
class UserController {
    private final JWTService jwtService;
    private final UserRepository userRepository;
    private final UsersService usersService;
    @Autowired
    public UserController(JWTService jwtService, UserRepository userRepository, UsersService usersService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.usersService = usersService;
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> update(@AuthenticationPrincipal CustomUserDetails principal, @RequestBody @Valid UserUpdateDTO  userUpdateDTO) {
        Long id = principal.getId();
        UserProfileDTO userupdate = usersService.update(id, userUpdateDTO);
        return ResponseEntity.ok(userupdate);
    }

    @PutMapping("/profile/changepassword")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal CustomUserDetails principal, @RequestBody ChangePasswodDTO passwordDto){
        Long id = principal.getId();
        usersService.changePassword(id, passwordDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@AuthenticationPrincipal CustomUserDetails principal) {
        Long id = principal.getId();
        UserProfileDTO userprofile = usersService.getUserProfile(id);
        return ResponseEntity.ok(userprofile);
    }
    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> findAll() {
        List<UserProfileDTO> users = usersService.findAllProlifes();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        usersService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }



}
