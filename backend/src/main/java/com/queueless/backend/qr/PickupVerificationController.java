package com.queueless.backend.qr;

import com.queueless.backend.qr.dto.PickupQrResponse;
import com.queueless.backend.qr.dto.PickupVerificationRequest;
import com.queueless.backend.qr.dto.PickupVerificationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PickupVerificationController {

    private final PickupVerificationService pickupVerificationService;

    @GetMapping("/orders/{orderId}/pickup-qr")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PickupQrResponse> getPickupQR(
            @PathVariable UUID orderId,
            Authentication authentication) {
        PickupQrResponse response = pickupVerificationService.getPickupQR(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/shop/pickup/verify")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<PickupVerificationResponse> verifyPickup(
            @Valid @RequestBody PickupVerificationRequest request,
            Authentication authentication) {
        PickupVerificationResponse response = pickupVerificationService.verifyPickup(request, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
