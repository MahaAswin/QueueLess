package com.queueless.backend.admin.dto;

import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.order.dto.OrderItemResponse;
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
public class AdminOrderDetailResponse {

    private UUID orderId;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    private UUID shopId;
    private String shopName;
    private String shopCategory;
    private String shopAddress;
    private String shopCity;
    private String shopPhone;
    private String ownerName;
    private String ownerEmail;

    private BigDecimal totalAmount;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private PickupSlotResponse pickupSlot;
    private Instant createdAt;
    private Instant updatedAt;

    public static AdminOrderDetailResponse fromEntity(Order order, PickupSlotResponse pickupSlot) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::fromEntity).collect(Collectors.toList())
                : List.of();

        return AdminOrderDetailResponse.builder()
                .orderId(order.getId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null)
                .customerEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .shopId(order.getShop() != null ? order.getShop().getId() : null)
                .shopName(order.getShop() != null ? order.getShop().getShopName() : null)
                .shopCategory(order.getShop() != null && order.getShop().getCategory() != null ? order.getShop().getCategory().name() : null)
                .shopAddress(order.getShop() != null ? order.getShop().getAddress() : null)
                .shopCity(order.getShop() != null ? order.getShop().getCity() : null)
                .shopPhone(order.getShop() != null ? order.getShop().getPhone() : null)
                .ownerName(order.getShop() != null && order.getShop().getOwner() != null ? order.getShop().getOwner().getFullName() : null)
                .ownerEmail(order.getShop() != null && order.getShop().getOwner() != null ? order.getShop().getOwner().getEmail() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .items(itemResponses)
                .pickupSlot(pickupSlot)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
