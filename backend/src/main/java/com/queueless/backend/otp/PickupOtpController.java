package com.queueless.backend.otp;

import com.queueless.backend.otp.dto.CustomerPickupOtpResponse;
import com.queueless.backend.otp.dto.ShopVerifyOtpRequest;
import com.queueless.backend.otp.dto.ShopVerifiedPickupResponse;
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
public class PickupOtpController {

    private final PickupOtpService pickupOtpService;

    @GetMapping("/orders/{orderId}/pickup-otp")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerPickupOtpResponse> getCustomerPickupOtp(
            @PathVariable UUID orderId,
            Authentication authentication) {
        CustomerPickupOtpResponse response = pickupOtpService.getOrGenerateCustomerOtp(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/shop/pickup/verify-otp")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ShopVerifiedPickupResponse> verifyPickupOtp(
            @Valid @RequestBody ShopVerifyOtpRequest request,
            Authentication authentication) {
        ShopVerifiedPickupResponse response = pickupOtpService.verifyPickupOtp(request, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
