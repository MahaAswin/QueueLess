package com.queueless.backend.complaint.dto;

import com.queueless.backend.complaint.ComplaintEvidence;
import com.queueless.backend.complaint.EvidenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceResponse {

    private UUID evidenceId;
    private EvidenceType type;
    private String fileUrl;
    private String description;
    private Instant createdAt;

    public static EvidenceResponse fromEntity(ComplaintEvidence evidence) {
        return EvidenceResponse.builder()
                .evidenceId(evidence.getId())
                .type(evidence.getType())
                .fileUrl(evidence.getFileUrl())
                .description(evidence.getDescription())
                .createdAt(evidence.getCreatedAt())
                .build();
    }
}
