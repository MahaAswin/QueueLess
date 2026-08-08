package com.queueless.backend.complaint.dto;

import com.queueless.backend.complaint.EvidenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddEvidenceRequest {

    @NotNull(message = "Evidence type is required")
    private EvidenceType type;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private String description;
}
