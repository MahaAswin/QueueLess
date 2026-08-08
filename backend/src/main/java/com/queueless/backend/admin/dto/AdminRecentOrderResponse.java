package com.queueless.backend.admin.dto;

import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRecentOrderResponse {

    private UUID orderId;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private UUID shopId;
    private String shopName;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private Instant createdAt;

    public static AdminRecentOrderResponse fromEntity(Order order) {
        return AdminRecentOrderResponse.builder()
                .orderId(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFullName())
                .customerEmail(order.getCustomer().getEmail())
                .shopId(order.getShop().getId())
                .shopName(order.getShop().getShopName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
