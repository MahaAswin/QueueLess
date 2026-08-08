package com.queueless.backend.complaint;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminTrustController {

    private final TrustService trustService;

    @PatchMapping("/users/{userId}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> suspendUser(@PathVariable UUID userId) {
        trustService.suspendUser(userId);
        return ResponseEntity.ok(Map.of("message", "User suspended successfully"));
    }

    @PatchMapping("/users/{userId}/reinstate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> reinstateUser(@PathVariable UUID userId) {
        trustService.reinstateUser(userId);
        return ResponseEntity.ok(Map.of("message", "User reinstated successfully"));
    }

    @PatchMapping("/shops/{shopId}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> suspendShop(@PathVariable UUID shopId) {
        trustService.suspendShop(shopId);
        return ResponseEntity.ok(Map.of("message", "Shop suspended successfully"));
    }

    @PatchMapping("/shops/{shopId}/reinstate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> reinstateShop(@PathVariable UUID shopId) {
        trustService.reinstateShop(shopId);
        return ResponseEntity.ok(Map.of("message", "Shop reinstated successfully"));
    }
}
