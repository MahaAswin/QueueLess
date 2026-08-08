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
public class ProductAnalyticsResponse {

    private long totalProducts;
    private long availableProducts;
    private long unavailableProducts;
    private long outOfStockProducts;
    private List<TopProductResponse> topProducts;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductResponse {
        private UUID productId;
        private String productName;
        private long totalQuantitySold;
    }
}
