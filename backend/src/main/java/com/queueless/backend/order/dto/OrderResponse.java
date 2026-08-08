package com.queueless.backend.order.dto;

import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private UUID id;
    private UUID customerId;
    private String customerName;
    private UUID shopId;
    private String shopName;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private PickupSlotResponse pickupSlot;
    private Instant createdAt;
    private Instant updatedAt;

    public static OrderResponse fromEntity(Order order) {
        return fromEntity(order, null);
    }

    public static OrderResponse fromEntity(Order order, PickupSlotResponse pickupSlot) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::fromEntity)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFullName())
                .shopId(order.getShop().getId())
                .shopName(order.getShop().getShopName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .items(itemResponses)
                .pickupSlot(pickupSlot)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
