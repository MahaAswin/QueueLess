package com.queueless.backend.slot;

import com.queueless.backend.slot.dto.CounterProposalRequest;
import com.queueless.backend.slot.dto.CreatePickupSlotRequest;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
public class PickupSlotController {

    private final PickupSlotService pickupSlotService;

    @PostMapping("/orders/{orderId}/pickup-slot")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PickupSlotResponse> requestPickupSlot(
            @PathVariable UUID orderId,
            @Valid @RequestBody CreatePickupSlotRequest request,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.requestPickupSlot(orderId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/orders/{orderId}/pickup-slot")
    public ResponseEntity<PickupSlotResponse> getSlotByOrder(
            @PathVariable UUID orderId,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.getSlotByOrder(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shop/pickup-slots")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<PickupSlotResponse>> getShopPickupSlots(Authentication authentication) {
        List<PickupSlotResponse> response = pickupSlotService.getShopPickupSlots(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pickup-slots/{slotId}/accept")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<PickupSlotResponse> acceptSlot(
            @PathVariable UUID slotId,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.acceptSlot(slotId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pickup-slots/{slotId}/reject")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<PickupSlotResponse> rejectSlot(
            @PathVariable UUID slotId,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.rejectSlot(slotId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pickup-slots/{slotId}/counter-propose")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<PickupSlotResponse> counterPropose(
            @PathVariable UUID slotId,
            @Valid @RequestBody CounterProposalRequest request,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.counterPropose(slotId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pickup-slots/{slotId}/customer-accept")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PickupSlotResponse> customerAccept(
            @PathVariable UUID slotId,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.customerAccept(slotId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pickup-slots/{slotId}/customer-reject")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PickupSlotResponse> customerReject(
            @PathVariable UUID slotId,
            Authentication authentication) {
        PickupSlotResponse response = pickupSlotService.customerReject(slotId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
