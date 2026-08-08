package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.ComplaintAnalyticsResponse;
import com.queueless.backend.admin.dto.OrderAnalyticsResponse;
import com.queueless.backend.admin.dto.ProductAnalyticsResponse;
import com.queueless.backend.admin.dto.ShopAnalyticsResponse;
import com.queueless.backend.admin.dto.TrustAnalyticsResponse;
import com.queueless.backend.admin.dto.UserAnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/orders")
    public ResponseEntity<OrderAnalyticsResponse> getOrderAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        OrderAnalyticsResponse response = adminAnalyticsService.getOrderAnalytics(from, to);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shops")
    public ResponseEntity<ShopAnalyticsResponse> getShopAnalytics() {
        ShopAnalyticsResponse response = adminAnalyticsService.getShopAnalytics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<UserAnalyticsResponse> getUserAnalytics() {
        UserAnalyticsResponse response = adminAnalyticsService.getUserAnalytics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products")
    public ResponseEntity<ProductAnalyticsResponse> getProductAnalytics() {
        ProductAnalyticsResponse response = adminAnalyticsService.getProductAnalytics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints")
    public ResponseEntity<ComplaintAnalyticsResponse> getComplaintAnalytics() {
        ComplaintAnalyticsResponse response = adminAnalyticsService.getComplaintAnalytics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trust")
    public ResponseEntity<TrustAnalyticsResponse> getTrustAnalytics() {
        TrustAnalyticsResponse response = adminAnalyticsService.getTrustAnalytics();
        return ResponseEntity.ok(response);
    }
}
