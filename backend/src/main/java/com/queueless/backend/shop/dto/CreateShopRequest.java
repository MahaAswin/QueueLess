package com.queueless.backend.shop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.queueless.backend.shop.ShopCategory;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShopRequest {

    @NotBlank(message = "Shop name is required")
    private String shopName;

    private String description;

    @NotNull(message = "Shop category is required")
    private ShopCategory category;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90.0")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180.0")
    private Double longitude;

    @NotNull(message = "Opening time is required")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime openingTime;

    @NotNull(message = "Closing time is required")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime closingTime;
}
