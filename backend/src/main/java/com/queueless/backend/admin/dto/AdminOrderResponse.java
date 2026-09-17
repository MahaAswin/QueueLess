package com.queueless.backend.admin.dto;

import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.slot.dto.PickupSlotResponse;
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
public class AdminOrderResponse {

    private UUID orderId;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private UUID shopId;
    private String shopName;
    private String shopCategory;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PickupSlotResponse pickupSlot;
    private Instant createdAt;
    private Instant updatedAt;

    public static AdminOrderResponse fromEntity(Order order) {
        return fromEntity(order, null);
    }

    public static AdminOrderResponse fromEntity(Order order, PickupSlotResponse pickupSlot) {
        return AdminOrderResponse.builder()
                .orderId(order.getId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null)
                .customerEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .shopId(order.getShop() != null ? order.getShop().getId() : null)
                .shopName(order.getShop() != null ? order.getShop().getShopName() : null)
                .shopCategory(order.getShop() != null && order.getShop().getCategory() != null ? order.getShop().getCategory().name() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .pickupSlot(pickupSlot)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
