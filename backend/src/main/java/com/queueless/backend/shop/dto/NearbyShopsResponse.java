package com.queueless.backend.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyShopsResponse {

    private List<NearbyShopResponse> shops;
    private double radiusMeters;
    private int count;
    private double userLatitude;
    private double userLongitude;
}
