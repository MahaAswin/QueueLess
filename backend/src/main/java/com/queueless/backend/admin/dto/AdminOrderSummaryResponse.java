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
public class AdminOrderSummaryResponse {

    private long totalOrders;
    private long pendingOrders;
    private long confirmedOrders;
    private long preparingOrders;
    private long readyForPickupOrders;
    private long collectedOrders;
    private long cancelledOrders;
    private long rejectedOrders;
    private BigDecimal totalRevenue;
}
