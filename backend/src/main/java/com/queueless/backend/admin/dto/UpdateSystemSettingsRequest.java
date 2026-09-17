package com.queueless.backend.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSystemSettingsRequest {

    @NotNull(message = "User suspension threshold is required")
    @Min(value = 1, message = "User suspension threshold must be at least 1")
    @Max(value = 20, message = "User suspension threshold cannot exceed 20")
    private Integer userSuspensionThreshold;

    @NotNull(message = "Shop suspension threshold is required")
    @Min(value = 1, message = "Shop suspension threshold must be at least 1")
    @Max(value = 20, message = "Shop suspension threshold cannot exceed 20")
    private Integer shopSuspensionThreshold;

    @NotNull(message = "QR code expiration minutes is required")
    @Min(value = 5, message = "QR code expiration minutes must be at least 5")
    @Max(value = 180, message = "QR code expiration minutes cannot exceed 180")
    private Integer qrExpirationMinutes;
}
