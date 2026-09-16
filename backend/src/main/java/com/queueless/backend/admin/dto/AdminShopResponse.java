package com.queueless.backend.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminShopResponse {

    private UUID shopId;
    private UUID id;
    private String shopName;
    private String name;
    private String description;
    private UUID ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
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
    private int validComplaintCount;
    private Instant createdAt;
    private Instant updatedAt;

    public static AdminShopResponse fromEntity(Shop shop) {
        if (shop == null) {
            return null;
        }

        return AdminShopResponse.builder()
                .shopId(shop.getId())
                .id(shop.getId())
                .shopName(shop.getShopName())
                .name(shop.getShopName())
                .description(shop.getDescription())
                .ownerId(shop.getOwner() != null ? shop.getOwner().getId() : null)
                .ownerName(shop.getOwner() != null ? shop.getOwner().getFullName() : null)
                .ownerEmail(shop.getOwner() != null ? shop.getOwner().getEmail() : null)
                .ownerPhone(shop.getOwner() != null ? shop.getOwner().getPhone() : null)
                .category(shop.getCategory())
                .phone(shop.getPhone())
                .address(shop.getAddress())
                .city(shop.getCity())
                .latitude(shop.getLatitude())
                .longitude(shop.getLongitude())
                .openingTime(shop.getOpeningTime())
                .closingTime(shop.getClosingTime())
                .status(shop.getStatus())
                .validComplaintCount(shop.getValidComplaintCount())
                .createdAt(shop.getCreatedAt())
                .updatedAt(shop.getUpdatedAt())
                .build();
    }
}
