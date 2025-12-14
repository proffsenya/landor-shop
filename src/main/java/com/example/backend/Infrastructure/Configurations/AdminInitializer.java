package com.example.backend.Infrastructure.Configurations;

import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Repos.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class AdminInitializer {
    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminConfiguration adminConfig;

    @Autowired
    private Environment environment;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @PostConstruct
    @Transactional
    public void init() {
        if (isTestProfile()) {
            log.info("Test profile detected, skipping admin creation");
            return;
        }

        if (adminConfig.getPassword() == null || adminConfig.getPassword().trim().isEmpty()) {
            log.warn("admin password is not set");
            log.warn("Set environment variable: ADMIN_PASSWORD=your_secure_password");
            log.warn("Or in application.yml: admin.password: your_secure_password");
            return;
        }
        createOrUpdateAdmin();
    }

    private boolean isTestProfile() {
        return activeProfile.contains("test") ||
                environment.acceptsProfiles(org.springframework.core.env.Profiles.of("test"));
    }

    private void createOrUpdateAdmin() {
        String adminEmail = adminConfig.getEmail();

        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            String hashedPassword = passwordEncoder.encode(adminConfig.getPassword());

            if (!passwordEncoder.matches(adminConfig.getPassword(), admin.getPasswordHash())) {
                admin.setPasswordHash(hashedPassword);
                admin.setIsSuperuser(true);
                admin.setIsStaff(true);
                admin.setIsActive(true);
                userRepository.save(admin);
                log.info("Admin user updated: {}", adminEmail);
            } else {
                log.info("Admin user already exists: {}", adminEmail);
            }
        } else {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setFirstName(adminConfig.getFirstName());
            admin.setLastName(adminConfig.getLastName());
            admin.setPhone(adminConfig.getPhone());

            String hashedPassword = passwordEncoder.encode(adminConfig.getPassword());
            admin.setPasswordHash(hashedPassword);
            admin.setIsSuperuser(true);
            admin.setIsStaff(true);
            admin.setIsActive(true);

            userRepository.save(admin);
            log.info("Admin user created: {}", adminEmail);
            logAdminCredentials();
        }
    }

    private void logAdminCredentials() {
        log.info("ADMIN CREDENTIALS (show only on first run)");
        log.info("Email: {}", adminConfig.getEmail());
        log.info("Password: {}", adminConfig.getPassword());

        if (isProductionProfile()) {
            log.warn("Store these credentials securely!");
        }
    }

    private boolean isProductionProfile() {
        return activeProfile.contains("prod") ||
                environment.acceptsProfiles(org.springframework.core.env.Profiles.of("prod"));
    }
}
