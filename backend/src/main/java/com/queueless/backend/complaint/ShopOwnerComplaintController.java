package com.queueless.backend.complaint;

import com.queueless.backend.complaint.dto.ComplaintResponse;
import com.queueless.backend.complaint.dto.CreateComplaintRequest;
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
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopOwnerComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/orders/{orderId}/complaints")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ComplaintResponse> createShopOwnerComplaint(
            @PathVariable UUID orderId,
            @Valid @RequestBody CreateComplaintRequest request,
            Authentication authentication) {
        ComplaintResponse response = complaintService.createShopOwnerComplaint(orderId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/complaints/my")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<ComplaintResponse>> getShopComplaints(Authentication authentication) {
        List<ComplaintResponse> response = complaintService.getShopComplaints(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
