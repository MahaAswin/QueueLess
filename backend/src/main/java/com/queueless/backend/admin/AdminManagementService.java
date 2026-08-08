package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminShopPageResponse;
import com.queueless.backend.admin.dto.AdminShopResponse;
import com.queueless.backend.admin.dto.AdminUserPageResponse;
import com.queueless.backend.admin.dto.AdminUserResponse;
import com.queueless.backend.common.ShopNotFoundException;
import com.queueless.backend.complaint.TrustService;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final TrustService trustService;

    @Transactional(readOnly = true)
    public AdminUserPageResponse getAdminUsers(Role role, AccountStatus accountStatus, String search, int page, int size) {
        int limitSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, limitSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAdminUsersFilter(role, accountStatus, search, pageRequest);

        List<AdminUserResponse> content = userPage.getContent().stream()
                .map(AdminUserResponse::fromEntity)
                .collect(Collectors.toList());

        return AdminUserPageResponse.builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .hasNext(userPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminShopPageResponse getAdminShops(ShopStatus status, ShopCategory category, String city, String search, int page, int size) {
        int limitSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, limitSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Shop> shopPage = shopRepository.findAdminShopsFilter(status, category, city, search, pageRequest);

        List<AdminShopResponse> content = shopPage.getContent().stream()
                .map(AdminShopResponse::fromEntity)
                .collect(Collectors.toList());

        return AdminShopPageResponse.builder()
                .content(content)
                .page(shopPage.getNumber())
                .size(shopPage.getSize())
                .totalElements(shopPage.getTotalElements())
                .totalPages(shopPage.getTotalPages())
                .hasNext(shopPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminShopPageResponse getPendingShops(int page, int size) {
        return getAdminShops(ShopStatus.PENDING, null, null, null, page, size);
    }

    @Transactional
    public void suspendUser(UUID userId) {
        trustService.suspendUser(userId);
    }

    @Transactional
    public void reinstateUser(UUID userId) {
        trustService.reinstateUser(userId);
    }

    @Transactional
    public void suspendShop(UUID shopId) {
        trustService.suspendShop(shopId);
    }

    @Transactional
    public void reinstateShop(UUID shopId) {
        trustService.reinstateShop(shopId);
    }

    @Transactional
    public AdminShopResponse activateShop(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));

        if (shop.getStatus() == ShopStatus.SUSPENDED) {
            throw new IllegalStateException("Cannot activate a suspended shop directly. Use reinstate endpoint.");
        }

        shop.setStatus(ShopStatus.ACTIVE);
        Shop updatedShop = shopRepository.save(shop);
        return AdminShopResponse.fromEntity(updatedShop);
    }
}
