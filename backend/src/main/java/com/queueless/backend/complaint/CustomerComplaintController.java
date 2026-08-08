package com.queueless.backend.complaint;

import com.queueless.backend.complaint.dto.AddEvidenceRequest;
import com.queueless.backend.complaint.dto.ComplaintResponse;
import com.queueless.backend.complaint.dto.CreateComplaintRequest;
import com.queueless.backend.complaint.dto.EvidenceResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/orders/{orderId}/complaints")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ComplaintResponse> createCustomerComplaint(
            @PathVariable UUID orderId,
            @Valid @RequestBody CreateComplaintRequest request,
            Authentication authentication) {
        ComplaintResponse response = complaintService.createCustomerComplaint(orderId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/complaints/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        List<ComplaintResponse> response = complaintService.getMyComplaints(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable UUID complaintId,
            Authentication authentication) {
        ComplaintResponse response = complaintService.getComplaintById(complaintId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complaints/{complaintId}/evidence")
    public ResponseEntity<EvidenceResponse> addEvidence(
            @PathVariable UUID complaintId,
            @Valid @RequestBody AddEvidenceRequest request,
            Authentication authentication) {
        EvidenceResponse response = complaintService.addEvidence(complaintId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
