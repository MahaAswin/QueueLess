package com.queueless.backend.admin.dto;

import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopStatus;
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
public class AdminShopResponse {

    private UUID shopId;
    private String shopName;
    private UUID ownerId;
    private String ownerName;
    private String ownerEmail;
    private ShopCategory category;
    private String city;
    private ShopStatus status;
    private int validComplaintCount;
    private Instant createdAt;

    public static AdminShopResponse fromEntity(Shop shop) {
        return AdminShopResponse.builder()
                .shopId(shop.getId())
                .shopName(shop.getShopName())
                .ownerId(shop.getOwner().getId())
                .ownerName(shop.getOwner().getFullName())
                .ownerEmail(shop.getOwner().getEmail())
                .category(shop.getCategory())
                .city(shop.getCity())
                .status(shop.getStatus())
                .validComplaintCount(shop.getValidComplaintCount())
                .createdAt(shop.getCreatedAt())
                .build();
    }
}
