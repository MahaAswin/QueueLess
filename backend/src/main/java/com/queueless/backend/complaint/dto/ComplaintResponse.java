package com.queueless.backend.complaint.dto;

import com.queueless.backend.complaint.Complaint;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.complaint.ComplaintType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private UUID complaintId;
    private UUID orderId;
    private UUID complainantId;
    private String complainantName;
    private UUID reportedUserId;
    private String reportedUserName;
    private UUID reportedShopId;
    private String reportedShopName;
    private ComplaintType type;
    private String description;
    private ComplaintStatus status;
    private int evidenceCount;
    private List<EvidenceResponse> evidenceItems;
    private String reviewNote;
    private String reviewedByAdminEmail;
    private LocalDateTime reviewedAt;
    private Instant createdAt;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        return fromEntity(complaint, Collections.emptyList());
    }

    public static ComplaintResponse fromEntity(Complaint complaint, List<EvidenceResponse> evidenceItems) {
        return ComplaintResponse.builder()
                .complaintId(complaint.getId())
                .orderId(complaint.getOrder().getId())
                .complainantId(complaint.getComplainant().getId())
                .complainantName(complaint.getComplainant().getFullName())
                .reportedUserId(complaint.getReportedUser().getId())
                .reportedUserName(complaint.getReportedUser().getFullName())
                .reportedShopId(complaint.getReportedShop() != null ? complaint.getReportedShop().getId() : null)
                .reportedShopName(complaint.getReportedShop() != null ? complaint.getReportedShop().getShopName() : null)
                .type(complaint.getType())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .evidenceCount(complaint.getEvidenceCount())
                .evidenceItems(evidenceItems)
                .reviewNote(complaint.getReviewNote())
                .reviewedByAdminEmail(complaint.getReviewedBy() != null ? complaint.getReviewedBy().getEmail() : null)
                .reviewedAt(complaint.getReviewedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }
}
