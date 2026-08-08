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
public class ShopAnalyticsResponse {

    private long totalShops;
    private long activeShops;
    private long pendingShops;
    private long suspendedShops;
    private long inactiveShops;
    private long shopsWithOrders;
    private long shopsWithoutOrders;
    private List<TopShopResponse> topShops;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopShopResponse {
        private UUID shopId;
        private String shopName;
        private long orderCount;
    }
}
