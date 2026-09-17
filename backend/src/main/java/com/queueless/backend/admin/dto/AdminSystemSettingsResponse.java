package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSystemSettingsResponse {

    private TrustSettings trustSettings;
    private PickupSettings pickupSettings;
    private PlatformSpecs platformSpecs;
    private Instant lastUpdatedAt;
    private String lastUpdatedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrustSettings {
        private int userSuspensionThreshold;
        private int shopSuspensionThreshold;
        private int minThreshold;
        private int maxThreshold;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PickupSettings {
        private int qrExpirationMinutes;
        private int minExpirationMinutes;
        private int maxExpirationMinutes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlatformSpecs {
        private String defaultAdminEmail;
        private long accessTokenExpirationMinutes;
        private long refreshTokenExpirationDays;
        private String corsAllowedOrigins;
        private String databaseEngine;
        private String environment;
    }
}
