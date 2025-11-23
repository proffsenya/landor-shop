package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.UserProfileDTO;
import com.example.backend.Domain.DTOs.UserUpdateDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsersService {
    private final UserRepository userRepository;
    public UsersService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    @Transactional
    public UserProfileDTO update(Long id, UserUpdateDTO  userUpdateDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new InvalidRequestException("User not found"));

        user.setFirstName(userUpdateDTO.firstName());
        user.setLastName(userUpdateDTO.lastName());
        user.setMiddleName(userUpdateDTO.middleName());
        user.setPasswordHash(userUpdateDTO.passwordHash());
        user.setPhone(userUpdateDTO.phone());
        user.setEmail(userUpdateDTO.email());
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        return toUserProfileDTO(user);
    }

    @Transactional
    public List<UserProfileDTO> findAllProlifes(){
        List<UserProfileDTO> userprofiles = new ArrayList<UserProfileDTO>();
        for (User user : userRepository.findAll()) {
            userprofiles.add(toUserProfileDTO(user));
        }
        return userprofiles;
    }

    @Transactional
    public UserProfileDTO getUserProfile(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new InvalidRequestException("User not found"));
        return toUserProfileDTO(user);
    }

    private UserProfileDTO toUserProfileDTO(User user) {
        return new UserProfileDTO(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getPhone(),
                user.getMiddleName()
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new InvalidRequestException("User not found"));
        userRepository.delete(user);
    }

}
