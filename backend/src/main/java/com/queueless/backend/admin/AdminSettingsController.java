package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminSystemSettingsResponse;
import com.queueless.backend.admin.dto.UpdateSystemSettingsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public ResponseEntity<AdminSystemSettingsResponse> getSystemSettings() {
        AdminSystemSettingsResponse response = adminSettingsService.getSystemSettings();
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<AdminSystemSettingsResponse> updateSystemSettings(
            @Valid @RequestBody UpdateSystemSettingsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails != null ? userDetails.getUsername() : "admin@queueless.com";
        AdminSystemSettingsResponse response = adminSettingsService.updateSystemSettings(request, adminEmail);
        return ResponseEntity.ok(response);
    }
}
