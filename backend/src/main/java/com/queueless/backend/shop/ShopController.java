package com.queueless.backend.shop;

import com.queueless.backend.shop.dto.CreateShopRequest;
import com.queueless.backend.shop.dto.ShopResponse;
import com.queueless.backend.shop.dto.UpdateShopRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @PostMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ShopResponse> createShop(
            @Valid @RequestBody CreateShopRequest request,
            Authentication authentication) {
        ShopResponse response = shopService.createShop(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ShopResponse> updateShop(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateShopRequest request,
            Authentication authentication) {
        ShopResponse response = shopService.updateShop(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<ShopResponse>> getMyShops(Authentication authentication) {
        List<ShopResponse> response = shopService.getMyShops(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShopResponse> getShopById(@PathVariable UUID id) {
        ShopResponse response = shopService.getShopById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ShopResponse>> getActiveShops() {
        List<ShopResponse> response = shopService.getActiveShops();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ShopResponse>> searchShops(@RequestParam(required = false, name = "name") String name) {
        List<ShopResponse> response = shopService.searchShops(name);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ShopResponse>> filterByCategory(@PathVariable ShopCategory category) {
        List<ShopResponse> response = shopService.filterByCategory(category);
        return ResponseEntity.ok(response);
    }
}
