package com.queueless.backend.config;

import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${queueless.admin.default-email}")
    private String adminEmail;

    @Value("${queueless.admin.default-password}")
    private String adminPassword;

    @Value("${queueless.admin.default-full-name:System Administrator}")
    private String adminFullName;

    @Value("${queueless.admin.default-phone}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        log.info("Checking QueueLess Single Default Admin Account status...");

        // 1. Validate required environment configuration
        if (adminEmail == null || adminEmail.isBlank() ||
            adminPassword == null || adminPassword.isBlank() ||
            adminPhone == null || adminPhone.isBlank()) {
            long existingAdmins = userRepository.countByRole(Role.ADMIN);
            if (existingAdmins == 0) {
                throw new IllegalStateException(
                    "CRITICAL: Missing required environment configuration for Single Default Admin initialization. " +
                    "Please set DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, and DEFAULT_ADMIN_PHONE in the environment."
                );
            }
            log.warn("Default Admin environment properties are not fully set, but {} existing Admin account(s) are present in the database.", existingAdmins);
            return;
        }

        try {
            // 2. Check if configured admin already exists by email
            Optional<User> existingAdminByEmail = userRepository.findByEmail(adminEmail);
            if (existingAdminByEmail.isPresent()) {
                User admin = existingAdminByEmail.get();
                boolean updated = false;

                if (admin.getRole() != Role.ADMIN) {
                    admin.setRole(Role.ADMIN);
                    updated = true;
                }
                if (admin.getAccountStatus() != AccountStatus.ACTIVE) {
                    admin.setAccountStatus(AccountStatus.ACTIVE);
                    updated = true;
                }
                if (updated) {
                    userRepository.save(admin);
                }
                log.info("Default Admin account verified and active for email [{}] (User ID: {})", admin.getEmail(), admin.getId());
                return;
            }

            // 3. Check if another Admin account already exists in the system
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount > 0) {
                log.warn("QueueLess already has {} active Admin account(s). Enforcing single-admin rule; no duplicate Admin will be created.", adminCount);
                return;
            }

            // 4. Check if a user exists with the configured phone number to prevent collision
            Optional<User> existingByPhone = userRepository.findByPhone(adminPhone);
            if (existingByPhone.isPresent()) {
                User user = existingByPhone.get();
                user.setEmail(adminEmail);
                user.setFullName(adminFullName);
                user.setRole(Role.ADMIN);
                user.setPassword(passwordEncoder.encode(adminPassword));
                user.setAccountStatus(AccountStatus.ACTIVE);
                User saved = userRepository.save(user);
                log.info("Existing user with phone [{}] promoted to Single Default Admin [{}] (User ID: {})", adminPhone, saved.getEmail(), saved.getId());
                return;
            }

            // 5. Create the single default Admin user with secure hashed password
            User defaultAdmin = User.builder()
                    .email(adminEmail)
                    .fullName(adminFullName)
                    .phone(adminPhone)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.ACTIVE)
                    .validComplaintCount(0)
                    .build();

            User savedAdmin = userRepository.save(defaultAdmin);
            log.info("Single Default Admin account successfully initialized for [{}] (User ID: {})", savedAdmin.getEmail(), savedAdmin.getId());

        } catch (Exception e) {
            log.error("Failed to verify/initialize Single Default Admin account: {}", e.getMessage(), e);
            throw e;
        }
    }
}

