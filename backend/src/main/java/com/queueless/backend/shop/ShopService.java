package com.queueless.backend.shop;

import com.queueless.backend.common.ShopNotFoundException;
import com.queueless.backend.shop.dto.CreateShopRequest;
import com.queueless.backend.shop.dto.ShopResponse;
import com.queueless.backend.shop.dto.UpdateShopRequest;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    @Transactional
    public ShopResponse createShop(CreateShopRequest request, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        if (user.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Only shop owners can create shops");
        }

        validateOperatingHours(request.getOpeningTime(), request.getClosingTime());

        Shop shop = Shop.builder()
                .owner(user)
                .shopName(request.getShopName())
                .description(request.getDescription())
                .category(request.getCategory())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .status(ShopStatus.PENDING)
                .build();

        Shop savedShop = shopRepository.save(shop);
        return ShopResponse.fromEntity(savedShop);
    }

    @Transactional
    public ShopResponse updateShop(UUID shopId, UpdateShopRequest request, String currentUserEmail) {
        Shop shop = getShopEntityById(shopId);

        if (!shop.getOwner().getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new AccessDeniedException("You are not authorized to update this shop");
        }

        if (shop.getStatus() == ShopStatus.SUSPENDED) {
            throw new AccessDeniedException("Suspended shops cannot be modified");
        }

        LocalTime newOpen = request.getOpeningTime() != null ? request.getOpeningTime() : shop.getOpeningTime();
        LocalTime newClose = request.getClosingTime() != null ? request.getClosingTime() : shop.getClosingTime();
        validateOperatingHours(newOpen, newClose);

        if (request.getShopName() != null && !request.getShopName().isBlank()) {
            shop.setShopName(request.getShopName());
        }
        if (request.getDescription() != null) {
            shop.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            shop.setCategory(request.getCategory());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            shop.setPhone(request.getPhone());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            shop.setAddress(request.getAddress());
        }
        if (request.getCity() != null && !request.getCity().isBlank()) {
            shop.setCity(request.getCity());
        }
        if (request.getLatitude() != null) {
            shop.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            shop.setLongitude(request.getLongitude());
        }
        if (request.getOpeningTime() != null) {
            shop.setOpeningTime(request.getOpeningTime());
        }
        if (request.getClosingTime() != null) {
            shop.setClosingTime(request.getClosingTime());
        }
        if (request.getStatus() != null) {
            if (request.getStatus() == ShopStatus.SUSPENDED) {
                throw new AccessDeniedException("Shop owners cannot suspend their own shop");
            }
            shop.setStatus(request.getStatus());
        }

        Shop updatedShop = shopRepository.save(shop);
        return ShopResponse.fromEntity(updatedShop);
    }

    @Transactional(readOnly = true)
    public ShopResponse getShopById(UUID shopId) {
        Shop shop = getShopEntityById(shopId);
        return ShopResponse.fromEntity(shop);
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> getMyShops(String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);
        return shopRepository.findByOwner(user).stream()
                .map(ShopResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> getActiveShops() {
        return shopRepository.findByStatus(ShopStatus.ACTIVE).stream()
                .map(ShopResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> searchShops(String name) {
        if (name == null || name.isBlank()) {
            return getActiveShops();
        }
        return shopRepository.findByStatusAndShopNameContainingIgnoreCase(ShopStatus.ACTIVE, name).stream()
                .map(ShopResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> filterByCategory(ShopCategory category) {
        return shopRepository.findByStatusAndCategory(ShopStatus.ACTIVE, category).stream()
                .map(ShopResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private Shop getShopEntityById(UUID shopId) {
        return shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));
    }

    private void validateOperatingHours(LocalTime open, LocalTime close) {
        if (open != null && close != null && !open.isBefore(close)) {
            throw new IllegalArgumentException("Closing time must be after opening time");
        }
    }
}
