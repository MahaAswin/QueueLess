package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardSummaryResponse {

    private UserSummary users;
    private ShopSummary shops;
    private ProductSummary products;
    private OrderSummary orders;
    private ComplaintSummary complaints;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private long totalUsers;
        private long totalCustomers;
        private long totalShopOwners;
        private long totalAdmins;
        private long suspendedUsers;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShopSummary {
        private long totalShops;
        private long pendingShops;
        private long activeShops;
        private long suspendedShops;
        private long inactiveShops;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductSummary {
        private long totalProducts;
        private long availableProducts;
        private long unavailableProducts;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSummary {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long preparingOrders;
        private long readyForPickupOrders;
        private long collectedOrders;
        private long rejectedOrders;
        private long cancelledOrders;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComplaintSummary {
        private long totalComplaints;
        private long pendingComplaints;
        private long validComplaints;
        private long invalidComplaints;
        private long dismissedComplaints;
    }
}
