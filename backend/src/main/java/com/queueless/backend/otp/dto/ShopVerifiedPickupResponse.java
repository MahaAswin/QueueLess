package com.queueless.backend.otp.dto;

import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.order.dto.OrderItemResponse;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopVerifiedPickupResponse {

    private UUID orderId;
    private OrderStatus orderStatus;
    private CustomerSummary customer;
    private String shopName;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private PickupSlotResponse pickupSlot;
    private LocalDateTime verifiedAt;
    private boolean verified;
    private String message;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerSummary {
        private UUID id;
        private String fullName;
        private String phone;
        private String email;
    }
}
