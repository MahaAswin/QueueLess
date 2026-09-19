package com.queueless.backend.otp.dto;

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
public class CustomerPickupOtpResponse {

    private UUID orderId;
    private String otp;
    private LocalDateTime expiresAt;
    private OrderStatus status;
    private String shopName;
}
