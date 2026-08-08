package com.queueless.backend.order;

import com.queueless.backend.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shop/orders")
@RequiredArgsConstructor
public class ShopOrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<OrderResponse>> getShopOrders(Authentication authentication) {
        List<OrderResponse> response = orderService.getShopOrders(authentication.getName());
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
}
