package com.queueless.backend.complaint.dto;

import com.queueless.backend.complaint.ComplaintStatus;
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
public class ReviewComplaintRequest {

    @NotNull(message = "Review status is required")
    private ComplaintStatus status;

    private String reviewNote;
}
