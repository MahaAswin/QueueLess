package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminSystemSettingsResponse;
import com.queueless.backend.admin.dto.UpdateSystemSettingsRequest;
import com.queueless.backend.setting.SystemSetting;
import com.queueless.backend.setting.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    public static final String KEY_USER_SUSPENSION_THRESHOLD = "USER_SUSPENSION_THRESHOLD";
    public static final String KEY_SHOP_SUSPENSION_THRESHOLD = "SHOP_SUSPENSION_THRESHOLD";
    public static final String KEY_QR_EXPIRATION_MINUTES = "QR_EXPIRATION_MINUTES";

    private final SystemSettingRepository systemSettingRepository;

    @Value("${queueless.trust.user-suspension-threshold:3}")
    private int defaultUserThreshold;

    @Value("${queueless.trust.shop-suspension-threshold:3}")
    private int defaultShopThreshold;

    @Value("${queueless.qr.expiration-minutes:30}")
    private int defaultQrExpirationMinutes;

    @Value("${queueless.admin.default-email:admin@queueless.com}")
    private String defaultAdminEmail;

    @Value("${queueless.jwt.access-token-expiration-ms:900000}")
    private long jwtAccessTokenExpirationMs;

    @Value("${queueless.jwt.refresh-token-expiration-ms:604800000}")
    private long jwtRefreshTokenExpirationMs;

    @Value("${queueless.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:8080}")
    private String corsAllowedOrigins;

    @Transactional(readOnly = true)
    public int getUserSuspensionThreshold() {
        return getIntegerSetting(KEY_USER_SUSPENSION_THRESHOLD, defaultUserThreshold);
    }

    @Transactional(readOnly = true)
    public int getShopSuspensionThreshold() {
        return getIntegerSetting(KEY_SHOP_SUSPENSION_THRESHOLD, defaultShopThreshold);
    }

    @Transactional(readOnly = true)
    public int getQrExpirationMinutes() {
        return getIntegerSetting(KEY_QR_EXPIRATION_MINUTES, defaultQrExpirationMinutes);
    }

    @Transactional(readOnly = true)
    public AdminSystemSettingsResponse getSystemSettings() {
        int userThreshold = getUserSuspensionThreshold();
        int shopThreshold = getShopSuspensionThreshold();
        int qrMinutes = getQrExpirationMinutes();

        // Calculate most recent update timestamp and author
        Instant lastUpdated = null;
        String lastAuthor = null;

        for (String key : new String[]{KEY_USER_SUSPENSION_THRESHOLD, KEY_SHOP_SUSPENSION_THRESHOLD, KEY_QR_EXPIRATION_MINUTES}) {
            Optional<SystemSetting> settingOpt = systemSettingRepository.findByKey(key);
            if (settingOpt.isPresent()) {
                SystemSetting s = settingOpt.get();
                if (s.getUpdatedAt() != null && (lastUpdated == null || s.getUpdatedAt().isAfter(lastUpdated))) {
                    lastUpdated = s.getUpdatedAt();
                    lastAuthor = s.getUpdatedBy();
                }
            }
        }

        return AdminSystemSettingsResponse.builder()
                .trustSettings(AdminSystemSettingsResponse.TrustSettings.builder()
                        .userSuspensionThreshold(userThreshold)
                        .shopSuspensionThreshold(shopThreshold)
                        .minThreshold(1)
                        .maxThreshold(20)
                        .build())
                .pickupSettings(AdminSystemSettingsResponse.PickupSettings.builder()
                        .qrExpirationMinutes(qrMinutes)
                        .minExpirationMinutes(5)
                        .maxExpirationMinutes(180)
                        .build())
                .platformSpecs(AdminSystemSettingsResponse.PlatformSpecs.builder()
                        .defaultAdminEmail(defaultAdminEmail)
                        .accessTokenExpirationMinutes(jwtAccessTokenExpirationMs / 60000)
                        .refreshTokenExpirationDays(jwtRefreshTokenExpirationMs / (1000 * 60 * 60 * 24))
                        .corsAllowedOrigins(corsAllowedOrigins)
                        .databaseEngine("PostgreSQL / Relational Store")
                        .environment("Production Operational Scope")
                        .build())
                .lastUpdatedAt(lastUpdated)
                .lastUpdatedBy(lastAuthor)
                .build();
    }

    @Transactional
    public AdminSystemSettingsResponse updateSystemSettings(UpdateSystemSettingsRequest request, String adminEmail) {
        if (request.getUserSuspensionThreshold() < 1 || request.getUserSuspensionThreshold() > 20) {
            throw new IllegalArgumentException("User suspension threshold must be between 1 and 20");
        }
        if (request.getShopSuspensionThreshold() < 1 || request.getShopSuspensionThreshold() > 20) {
            throw new IllegalArgumentException("Shop suspension threshold must be between 1 and 20");
        }
        if (request.getQrExpirationMinutes() < 5 || request.getQrExpirationMinutes() > 180) {
            throw new IllegalArgumentException("QR code expiration minutes must be between 5 and 180");
        }

        saveSetting(KEY_USER_SUSPENSION_THRESHOLD,
                String.valueOf(request.getUserSuspensionThreshold()),
                "TRUST_AND_SAFETY",
                "Number of valid dispute violations triggering automated customer account suspension",
                adminEmail);

        saveSetting(KEY_SHOP_SUSPENSION_THRESHOLD,
                String.valueOf(request.getShopSuspensionThreshold()),
                "TRUST_AND_SAFETY",
                "Number of valid dispute violations triggering automated shop suspension",
                adminEmail);

        saveSetting(KEY_QR_EXPIRATION_MINUTES,
                String.valueOf(request.getQrExpirationMinutes()),
                "ORDERS_AND_PICKUP",
                "Lifetime validity window in minutes for customer pickup QR verification tokens",
                adminEmail);

        log.info("System settings updated by Admin [{}]: userSuspensionThreshold={}, shopSuspensionThreshold={}, qrExpirationMinutes={}",
                adminEmail, request.getUserSuspensionThreshold(), request.getShopSuspensionThreshold(), request.getQrExpirationMinutes());

        return getSystemSettings();
    }

    private int getIntegerSetting(String key, int defaultValue) {
        Optional<SystemSetting> setting = systemSettingRepository.findByKey(key);
        if (setting.isPresent()) {
            try {
                return Integer.parseInt(setting.get().getValue());
            } catch (NumberFormatException e) {
                log.warn("Invalid integer value [{}] for setting key [{}], using default [{}]",
                        setting.get().getValue(), key, defaultValue);
            }
        }
        return defaultValue;
    }

    private void saveSetting(String key, String value, String category, String description, String updatedBy) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .key(key)
                        .category(category)
                        .description(description)
                        .build());

        setting.setValue(value);
        setting.setCategory(category);
        setting.setDescription(description);
        setting.setUpdatedBy(updatedBy);
        setting.setUpdatedAt(Instant.now());

        systemSettingRepository.save(setting);
    }
}
