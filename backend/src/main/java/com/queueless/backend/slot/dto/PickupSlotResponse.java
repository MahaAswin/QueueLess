package com.queueless.backend.slot.dto;

import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupSlotResponse {

    private UUID slotId;
    private UUID id;
    private UUID orderId;
    private UUID shopId;
    private String shopName;
    private UUID customerId;
    private String customerName;
    private LocalDate pickupDate;
    private LocalTime requestedStartTime;
    private LocalTime requestedEndTime;
    private LocalDate proposedDate;
    private LocalTime proposedStartTime;
    private LocalTime proposedEndTime;
    private LocalDate finalPickupDate;
    private LocalTime finalStartTime;
    private LocalTime finalEndTime;
    private PickupSlotStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public static PickupSlotResponse fromEntity(PickupSlot slot) {
        LocalDate finalDate = null;
        LocalTime finalStart = null;
        LocalTime finalEnd = null;

        if (slot.getStatus() == PickupSlotStatus.ACCEPTED) {
            finalDate = slot.getPickupDate();
            finalStart = slot.getRequestedStartTime();
            finalEnd = slot.getRequestedEndTime();
        } else if (slot.getStatus() == PickupSlotStatus.CUSTOMER_ACCEPTED) {
            finalDate = slot.getProposedDate();
            finalStart = slot.getProposedStartTime();
            finalEnd = slot.getProposedEndTime();
        }

        UUID sId = null;
        String sName = null;
        UUID cId = null;
        String cName = null;

        if (slot.getOrder() != null) {
            if (slot.getOrder().getShop() != null) {
                sId = slot.getOrder().getShop().getId();
                sName = slot.getOrder().getShop().getShopName();
            }
            if (slot.getOrder().getCustomer() != null) {
                cId = slot.getOrder().getCustomer().getId();
                cName = slot.getOrder().getCustomer().getFullName();
            }
        }

        return PickupSlotResponse.builder()
                .slotId(slot.getId())
                .id(slot.getId())
                .orderId(slot.getOrder() != null ? slot.getOrder().getId() : null)
                .shopId(sId)
                .shopName(sName)
                .customerId(cId)
                .customerName(cName)
                .pickupDate(slot.getPickupDate())
                .requestedStartTime(slot.getRequestedStartTime())
                .requestedEndTime(slot.getRequestedEndTime())
                .proposedDate(slot.getProposedDate())
                .proposedStartTime(slot.getProposedStartTime())
                .proposedEndTime(slot.getProposedEndTime())
                .finalPickupDate(finalDate)
                .finalStartTime(finalStart)
                .finalEndTime(finalEnd)
                .status(slot.getStatus())
                .createdAt(slot.getCreatedAt())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }
}
