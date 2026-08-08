package com.queueless.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintAnalyticsResponse {

    private long totalComplaints;
    private long submittedComplaints;
    private long underReviewComplaints;
    private long validComplaints;
    private long invalidComplaints;
    private long dismissedComplaints;
    private Map<String, Long> byType;
}
