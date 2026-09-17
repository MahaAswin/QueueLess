package com.queueless.backend.complaint;

import com.queueless.backend.complaint.dto.ComplaintResponse;
import com.queueless.backend.complaint.dto.ReviewComplaintRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/complaints")
@RequiredArgsConstructor
public class AdminComplaintController {

    private final ComplaintReviewService complaintReviewService;
    private final ComplaintService complaintService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.queueless.backend.admin.dto.AdminComplaintPageResponse> getAdminComplaints(
            @org.springframework.web.bind.annotation.RequestParam(required = false) ComplaintStatus status,
            @org.springframework.web.bind.annotation.RequestParam(required = false) ComplaintType type,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        com.queueless.backend.admin.dto.AdminComplaintPageResponse response =
                complaintReviewService.getAdminComplaints(status, type, search, page, size, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.queueless.backend.admin.dto.AdminComplaintSummaryResponse> getComplaintSummary(
            Authentication authentication
    ) {
        com.queueless.backend.admin.dto.AdminComplaintSummaryResponse response =
                complaintReviewService.getComplaintSummary(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{complaintId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable UUID complaintId,
            Authentication authentication) {
        ComplaintResponse response = complaintService.getComplaintById(complaintId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{complaintId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> reviewComplaint(
            @PathVariable UUID complaintId,
            @Valid @RequestBody ReviewComplaintRequest request,
            Authentication authentication) {
        ComplaintResponse response = complaintReviewService.reviewComplaint(complaintId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
