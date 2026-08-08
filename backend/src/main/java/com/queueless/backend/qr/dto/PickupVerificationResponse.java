package com.queueless.backend.qr.dto;

import com.queueless.backend.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupVerificationResponse {

    private boolean success;
    private String message;
    private UUID orderId;
    private OrderStatus status;
    private String shopName;
    private LocalDateTime collectedAt;
}
