package com.queueless.backend.complaint.dto;

import com.queueless.backend.complaint.ComplaintType;
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
public class CreateComplaintRequest {

    @NotNull(message = "Complaint type is required")
    private ComplaintType type;

    @NotBlank(message = "Complaint description is required")
    private String description;
}
