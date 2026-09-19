package com.queueless.backend.order;

import com.queueless.backend.order.dto.CustomerExpenseSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/summary")
@RequiredArgsConstructor
public class CustomerSummaryController {

    private final OrderService orderService;

    @GetMapping("/expenses")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerExpenseSummaryResponse> getCustomerExpenseSummary(Authentication authentication) {
        CustomerExpenseSummaryResponse response = orderService.getCustomerExpenseSummary(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
