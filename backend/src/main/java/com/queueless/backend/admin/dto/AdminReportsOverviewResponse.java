package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReportsOverviewResponse {

    private OverviewMetrics overview;
    private List<OrderStatusMetric> orderStatusDistribution;
    private List<TimeSeriesPoint> ordersOverTime;
    private List<TopShopMetric> topShops;
    private Map<String, Long> complaintsByType;
    private Map<String, Long> complaintsByStatus;
    private Map<String, Long> userRoleDistribution;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverviewMetrics {
        private long totalUsers;
        private long totalCustomers;
        private long totalShopOwners;
        private long totalShops;
        private long activeShops;
        private long pendingShops;
        private long suspendedShops;
        private long totalOrders;
        private long completedOrders;
        private long cancelledOrders;
        private long pendingOrders;
        private BigDecimal totalOrderValue;
        private BigDecimal collectedOrderValue;
        private BigDecimal averageOrderValue;
        private long totalComplaints;
        private long pendingComplaints;
        private long resolvedComplaints;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatusMetric {
        private String status;
        private long count;
        private BigDecimal totalValue;
        private double percentage;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSeriesPoint {
        private String date; // YYYY-MM-DD
        private long orderCount;
        private long completedCount;
        private long cancelledCount;
        private BigDecimal orderValue;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopShopMetric {
        private UUID shopId;
        private String shopName;
        private String category;
        private String status;
        private int validComplaintCount;
        private long totalOrders;
        private long completedOrders;
        private long cancelledOrders;
        private BigDecimal totalOrderValue;
    }
}
