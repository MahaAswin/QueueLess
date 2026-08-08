package com.queueless.backend.shop.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.queueless.backend.auth.dto.UserResponse;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopResponse {

    private UUID id;
    private UserResponse owner;
    private String shopName;
    private String description;
    private ShopCategory category;
    private String phone;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime openingTime;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime closingTime;

    private ShopStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public static ShopResponse fromEntity(Shop shop) {
        return ShopResponse.builder()
                .id(shop.getId())
                .owner(UserResponse.fromEntity(shop.getOwner()))
                .shopName(shop.getShopName())
                .description(shop.getDescription())
                .category(shop.getCategory())
                .phone(shop.getPhone())
                .address(shop.getAddress())
                .city(shop.getCity())
                .latitude(shop.getLatitude())
                .longitude(shop.getLongitude())
                .openingTime(shop.getOpeningTime())
                .closingTime(shop.getClosingTime())
                .status(shop.getStatus())
                .createdAt(shop.getCreatedAt())
                .updatedAt(shop.getUpdatedAt())
                .build();
    }
}
