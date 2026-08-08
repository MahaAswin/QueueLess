package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAnalyticsResponse {

    private long totalOrders;
    private long completedOrders;
    private long cancelledOrders;
    private long rejectedOrders;
    private BigDecimal totalOrderValue;
    private BigDecimal averageOrderValue;
}
