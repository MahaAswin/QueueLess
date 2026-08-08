package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustAnalyticsResponse {

    private long usersWithViolations;
    private long suspendedUsers;
    private long shopsWithViolations;
    private long suspendedShops;
    private long totalValidViolations;
    private List<UserViolationSummary> topUserViolations;
    private List<ShopViolationSummary> topShopViolations;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserViolationSummary {
        private UUID userId;
        private String fullName;
        private String email;
        private int validComplaintCount;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShopViolationSummary {
        private UUID shopId;
        private String shopName;
        private int validComplaintCount;
    }
}
