package com.queueless.backend.shop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class UpdateShopRequest {

    private String shopName;
    private String description;
    private ShopCategory category;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phone;

    private String address;
    private String city;

    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90.0")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180.0")
    private Double longitude;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime openingTime;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime closingTime;

    private ShopStatus status;
}
