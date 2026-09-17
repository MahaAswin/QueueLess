package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminOrderDetailResponse;
import com.queueless.backend.admin.dto.AdminOrderPageResponse;
import com.queueless.backend.admin.dto.AdminOrderSummaryResponse;
import com.queueless.backend.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<AdminOrderPageResponse> getAdminOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) UUID shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminOrderPageResponse response = adminOrderService.getAdminOrders(status, shopId, from, to, search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<AdminOrderDetailResponse> getAdminOrderById(@PathVariable UUID orderId) {
        AdminOrderDetailResponse response = adminOrderService.getAdminOrderById(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminOrderSummaryResponse> getOrderSummary() {
        AdminOrderSummaryResponse response = adminOrderService.getOrderSummary();
        return ResponseEntity.ok(response);
    }
}
