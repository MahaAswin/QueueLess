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
public class NearbyShopResponse {

    private UUID id;
    private String shopName;
    private String name;
    private String description;
    private String imageUrl;
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

    // Proximity fields
    private Double distanceMeters;
    private String distanceFormatted;
    private boolean isOpen;
    private int averageWaitMinutes;

    public static NearbyShopResponse fromEntity(Shop shop, double distanceMeters, boolean isOpen, int averageWaitMinutes) {
        String formattedDistance = formatDistance(distanceMeters);
        String displayName = shop.getShopName() != null ? shop.getShopName() : "";

        return NearbyShopResponse.builder()
                .id(shop.getId())
                .shopName(displayName)
                .name(displayName)
                .description(shop.getDescription())
                .imageUrl(shop.getImageUrl())
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
                .distanceMeters(Math.round(distanceMeters * 10.0) / 10.0)
                .distanceFormatted(formattedDistance)
                .isOpen(isOpen)
                .averageWaitMinutes(averageWaitMinutes)
                .build();
    }

    public static String formatDistance(double meters) {
        if (meters < 1000) {
            return Math.round(meters) + " m";
        } else {
            double km = meters / 1000.0;
            return String.format(java.util.Locale.US, "%.1f km", km);
        }
    }
}
