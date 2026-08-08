package com.queueless.backend.complaint;

import com.queueless.backend.common.ShopNotFoundException;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import com.queueless.backend.notification.NotificationService;
import com.queueless.backend.notification.NotificationType;

@Service
@RequiredArgsConstructor
public class TrustService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final NotificationService notificationService;

    @Value("${queueless.trust.user-suspension-threshold:3}")
    private int userThreshold;

    @Value("${queueless.trust.shop-suspension-threshold:3}")
    private int shopThreshold;

    @Transactional
    public void processValidComplaint(Complaint complaint) {
        User reportedUser = complaint.getReportedUser();
        boolean userWasSuspended = reportedUser.getAccountStatus() == AccountStatus.SUSPENDED;
        reportedUser.setValidComplaintCount(reportedUser.getValidComplaintCount() + 1);
        if (reportedUser.getValidComplaintCount() >= userThreshold) {
            reportedUser.setAccountStatus(AccountStatus.SUSPENDED);
            if (!userWasSuspended) {
                notificationService.createNotification(
                        reportedUser,
                        NotificationType.ACCOUNT_SUSPENDED,
                        "Account Suspended",
                        "Your account has been suspended due to policy violations.",
                        complaint.getOrder().getId(),
                        complaint.getReportedShop() != null ? complaint.getReportedShop().getId() : null
                );
            }
        }
        userRepository.save(reportedUser);

        Shop reportedShop = complaint.getReportedShop();
        if (reportedShop != null) {
            boolean shopWasSuspended = reportedShop.getStatus() == ShopStatus.SUSPENDED;
            reportedShop.setValidComplaintCount(reportedShop.getValidComplaintCount() + 1);
            if (reportedShop.getValidComplaintCount() >= shopThreshold) {
                reportedShop.setStatus(ShopStatus.SUSPENDED);
                if (!shopWasSuspended) {
                    notificationService.createNotification(
                            reportedShop.getOwner(),
                            NotificationType.SHOP_SUSPENDED,
                            "Shop Suspended",
                            "Your shop has been suspended due to policy violations.",
                            complaint.getOrder().getId(),
                            reportedShop.getId()
                    );
                }
            }
            shopRepository.save(reportedShop);
        }
    }

    @Transactional
    public void suspendUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);

        notificationService.createNotification(
                user,
                NotificationType.ACCOUNT_SUSPENDED,
                "Account Suspended",
                "Your account has been suspended due to policy violations.",
                null,
                null
        );
    }

    @Transactional
    public void reinstateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        notificationService.createNotification(
                user,
                NotificationType.ACCOUNT_REINSTATED,
                "Account Reinstated",
                "Your account has been reinstated.",
                null,
                null
        );
    }

    @Transactional
    public void suspendShop(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));
        shop.setStatus(ShopStatus.SUSPENDED);
        shopRepository.save(shop);

        notificationService.createNotification(
                shop.getOwner(),
                NotificationType.SHOP_SUSPENDED,
                "Shop Suspended",
                "Your shop has been suspended due to policy violations.",
                null,
                shop.getId()
        );
    }

    @Transactional
    public void reinstateShop(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));
        shop.setStatus(ShopStatus.ACTIVE);
        shopRepository.save(shop);

        notificationService.createNotification(
                shop.getOwner(),
                NotificationType.SHOP_REINSTATED,
                "Shop Reinstated",
                "Your shop has been reinstated.",
                null,
                shop.getId()
        );
    }
}

