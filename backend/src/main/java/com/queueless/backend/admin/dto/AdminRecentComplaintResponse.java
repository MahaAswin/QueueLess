package com.queueless.backend.admin.dto;

import com.queueless.backend.complaint.Complaint;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.complaint.ComplaintType;
import com.queueless.backend.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRecentComplaintResponse {

    private UUID complaintId;
    private UUID orderId;
    private ComplaintType complaintType;
    private ComplaintStatus status;
    private Role complainantRole;
    private Role reportedUserRole;
    private Instant createdAt;
    private LocalDateTime reviewedAt;

    public static AdminRecentComplaintResponse fromEntity(Complaint complaint) {
        return AdminRecentComplaintResponse.builder()
                .complaintId(complaint.getId())
                .orderId(complaint.getOrder().getId())
                .complaintType(complaint.getType())
                .status(complaint.getStatus())
                .complainantRole(complaint.getComplainant().getRole())
                .reportedUserRole(complaint.getReportedUser().getRole())
                .createdAt(complaint.getCreatedAt())
                .reviewedAt(complaint.getReviewedAt())
                .build();
    }
}
