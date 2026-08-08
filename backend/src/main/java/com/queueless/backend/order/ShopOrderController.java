package com.queueless.backend.order;

import com.queueless.backend.order.dto.OrderPageResponse;
import com.queueless.backend.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/shop/orders")
@RequiredArgsConstructor
public class ShopOrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<OrderPageResponse> getShopOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        OrderPageResponse response = orderService.getShopOrders(authentication.getName(), status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<OrderResponse> getShopOrderById(
            @PathVariable UUID orderId,
            Authentication authentication) {
        OrderResponse response = orderService.getShopOrderById(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{orderId}/confirm")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<OrderResponse> confirmOrder(
            @PathVariable UUID orderId,
            Authentication authentication) {
        OrderResponse response = orderService.confirmOrder(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{orderId}/reject")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<OrderResponse> rejectOrder(
            @PathVariable UUID orderId,
            Authentication authentication) {
        OrderResponse response = orderService.rejectOrder(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{orderId}/preparing")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<OrderResponse> startPreparing(
            @PathVariable UUID orderId,
            Authentication authentication) {
        OrderResponse response = orderService.startPreparing(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{orderId}/ready")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<OrderResponse> markOrderReadyForPickup(
            @PathVariable UUID orderId,
            Authentication authentication) {
        OrderResponse response = orderService.markOrderReadyForPickup(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
