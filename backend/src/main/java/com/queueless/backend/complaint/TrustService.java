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

@Service
@RequiredArgsConstructor
public class TrustService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    @Value("${queueless.trust.user-suspension-threshold:3}")
    private int userThreshold;

    @Value("${queueless.trust.shop-suspension-threshold:3}")
    private int shopThreshold;

    @Transactional
    public void processValidComplaint(Complaint complaint) {
        User reportedUser = complaint.getReportedUser();
        reportedUser.setValidComplaintCount(reportedUser.getValidComplaintCount() + 1);
        if (reportedUser.getValidComplaintCount() >= userThreshold) {
            reportedUser.setAccountStatus(AccountStatus.SUSPENDED);
        }
        userRepository.save(reportedUser);

        Shop reportedShop = complaint.getReportedShop();
        if (reportedShop != null) {
            reportedShop.setValidComplaintCount(reportedShop.getValidComplaintCount() + 1);
            if (reportedShop.getValidComplaintCount() >= shopThreshold) {
                reportedShop.setStatus(ShopStatus.SUSPENDED);
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
    }

    @Transactional
    public void reinstateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void suspendShop(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));
        shop.setStatus(ShopStatus.SUSPENDED);
        shopRepository.save(shop);
    }

    @Transactional
    public void reinstateShop(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));
        shop.setStatus(ShopStatus.ACTIVE);
        shopRepository.save(shop);
    }
}
