package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminComplaintSummaryResponse {

    private long totalComplaints;
    private long submittedComplaints;
    private long underReviewComplaints;
    private long validComplaints;
    private long invalidComplaints;
    private long dismissedComplaints;
}
