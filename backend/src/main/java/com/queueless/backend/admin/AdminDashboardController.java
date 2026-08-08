package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminDashboardSummaryResponse;
import com.queueless.backend.admin.dto.AdminRecentComplaintPageResponse;
import com.queueless.backend.admin.dto.AdminRecentOrderPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<AdminDashboardSummaryResponse> getDashboardSummary() {
        AdminDashboardSummaryResponse response = adminDashboardService.getSummaryMetrics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/recent")
    public ResponseEntity<AdminRecentOrderPageResponse> getRecentOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminRecentOrderPageResponse response = adminDashboardService.getRecentOrders(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints/recent")
    public ResponseEntity<AdminRecentComplaintPageResponse> getRecentComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminRecentComplaintPageResponse response = adminDashboardService.getRecentComplaints(page, size);
        return ResponseEntity.ok(response);
    }
}
