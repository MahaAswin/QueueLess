package com.queueless.backend.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerExpenseSummaryResponse {

    private BigDecimal totalSpent;
    private long completedOrders;
    private long totalOrders;
    private long activeOrders;
    private BigDecimal averageOrderValue;
}
