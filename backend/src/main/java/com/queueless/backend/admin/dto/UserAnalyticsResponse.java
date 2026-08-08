package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAnalyticsResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalShopOwners;
    private long totalAdmins;
    private long suspendedUsers;
    private long activeUsers;
}
