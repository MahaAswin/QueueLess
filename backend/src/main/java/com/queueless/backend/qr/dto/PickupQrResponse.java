package com.queueless.backend.qr.dto;

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
public class PickupQrResponse {

    private UUID orderId;
    private String pickupToken;
    private LocalDateTime expiresAt;
}
