package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.AdminCreateUserRequestDTO;
import com.example.backend.Domain.DTOs.ChangePasswodDTO;
import com.example.backend.Domain.DTOs.UserProfileDTO;
import com.example.backend.Domain.DTOs.UserUpdateDTO;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsersService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
                user.getMiddleName(),
                user.getIsActive(),
                user.getIsStaff(),
                user.getIsSuperuser()
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new InvalidRequestException("User not found"));
        userRepository.delete(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswodDTO changePasswodDTO) {
        System.out.println("=== PASSWORD CHANGE DEBUG ===");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        System.out.println("User ID: " + userId);
        System.out.println("User email: " + user.getEmail());
        System.out.println("Current password input: " + changePasswodDTO.currentPassword());
        System.out.println("New password input: " + changePasswodDTO.newPassword());
        System.out.println("Confirm password input: " + changePasswodDTO.confirmPassword());

        // Проверка текущего пароля
        boolean currentPasswordValid = passwordEncoder.matches(
                changePasswodDTO.currentPassword(),
                user.getPasswordHash()
        );
        System.out.println("Current password valid: " + currentPasswordValid);

        if (!currentPasswordValid) {
            System.out.println("ERROR: Current password invalid!");
            throw new InvalidRequestException("Current password is incorrect");
        }

        // Хэшируем новый пароль
        String newHashedPassword = passwordEncoder.encode(changePasswodDTO.newPassword());
        System.out.println("New hashed password: " + newHashedPassword);

        // Сохраняем
        user.setPasswordHash(newHashedPassword);
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);
        System.out.println("Password updated successfully");
        System.out.println("Saved user hash: " + savedUser.getPasswordHash());
        System.out.println("=== END DEBUG ===");
    }

    @Transactional
    public UserProfileDTO createUserByAdmin(AdminCreateUserRequestDTO dto){
        if (userRepository.findByEmail(dto.email()) != null){
            throw new InvalidRequestException("Email already in use");
        }

        User user = new User();
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setMiddleName(dto.middleName());
        user.setPhone(dto.phone());
        user.setEmail(dto.email());
        user.setPasswordHash(passwordEncoder.encode(dto.passwordHash()));
        user.setCreatedAt(Instant.now());

        user.setIsSuperuser(false);
        user.setIsStaff(dto.isStaff() != null ? dto.isStaff() : false);
        user.setIsActive(dto.isActive() != null ? dto.isActive() : false);

        User savedUser = userRepository.save(user);

        return toUserProfileDTO(savedUser);
    }
}
