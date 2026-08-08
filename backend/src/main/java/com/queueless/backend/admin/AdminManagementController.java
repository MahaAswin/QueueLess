package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminShopPageResponse;
import com.queueless.backend.admin.dto.AdminShopResponse;
import com.queueless.backend.admin.dto.AdminUserPageResponse;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminManagementController {

    private final AdminManagementService adminManagementService;

    @GetMapping("/users")
    public ResponseEntity<AdminUserPageResponse> getAdminUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus accountStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminUserPageResponse response = adminManagementService.getAdminUsers(role, accountStatus, search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shops")
    public ResponseEntity<AdminShopPageResponse> getAdminShops(
            @RequestParam(required = false) ShopStatus status,
            @RequestParam(required = false) ShopCategory category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminShopPageResponse response = adminManagementService.getAdminShops(status, category, city, search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shops/pending")
    public ResponseEntity<AdminShopPageResponse> getPendingShops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminShopPageResponse response = adminManagementService.getPendingShops(page, size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/shops/{shopId}/activate")
    public ResponseEntity<AdminShopResponse> activateShop(@PathVariable UUID shopId) {
        AdminShopResponse response = adminManagementService.activateShop(shopId);
        return ResponseEntity.ok(response);
    }
}
