package com.queueless.backend.admin;

import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Backend initialization runner that promotes an existing QueueLess user account
 * to the single protected ADMIN role based on the configured DEFAULT_ADMIN_EMAIL.
 * 
 * Rules:
 * 1. Controlled promotion: CUSTOMER -> ADMIN.
 * 2. Never creates an Admin user automatically if not present.
 * 3. Never modifies or requires an Admin password.
 * 4. Idempotent: safe across multiple restarts.
 * 5. Single Admin Rule: flags conflicting ADMIN accounts if any exist.
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class AdminPromotionInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    @Value("${queueless.admin.default-email:}")
    private String defaultAdminEmail;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (defaultAdminEmail == null || defaultAdminEmail.isBlank()) {
            log.info("No DEFAULT_ADMIN_EMAIL configured. Skipping Admin role promotion.");
            return;
        }

        String targetEmail = defaultAdminEmail.trim();
        Optional<User> targetUserOptional = userRepository.findByEmail(targetEmail);

        List<User> existingAdmins = userRepository.findByRole(Role.ADMIN);

        if (targetUserOptional.isEmpty()) {
            log.warn("Configured Admin user [{}] was not found in the database. " +
                     "Admin promotion skipped. A standard user account with this email must be registered/seeded first.", targetEmail);
            if (!existingAdmins.isEmpty()) {
                log.info("Current ADMIN account(s) in system: {}",
                        existingAdmins.stream().map(User::getEmail).collect(Collectors.joining(", ")));
            }
            return;
        }

        User targetUser = targetUserOptional.get();

        if (targetUser.getRole() == Role.ADMIN) {
            log.info("Configured Admin user [{}] is already assigned the ADMIN role. (Idempotent initialization completed)", targetEmail);
            if (existingAdmins.size() > 1) {
                log.warn("WARNING: Multiple ADMIN accounts detected in database! Configured: [{}], Found total: {}",
                        targetEmail, existingAdmins.size());
            }
            return;
        }

        // Account exists with a non-admin role (e.g. CUSTOMER / SHOP_OWNER)
        Role previousRole = targetUser.getRole();

        if (!existingAdmins.isEmpty()) {
            log.warn("WARNING: Conflicting existing ADMIN account(s) detected [{}]. " +
                     "Promoting configured target user [{}] to ADMIN as single intended administrator.",
                    existingAdmins.stream().map(User::getEmail).collect(Collectors.joining(", ")),
                    targetEmail);
        }

        // Promote the existing user to ADMIN while preserving password hash, UUID, phone, and all other metadata
        targetUser.setRole(Role.ADMIN);
        userRepository.save(targetUser);

        log.info("Successfully promoted existing user [{}] from role {} to protected ADMIN role. Existing password and account metadata preserved.",
                targetEmail, previousRole);
    }
}
