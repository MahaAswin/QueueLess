package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.ComplaintAnalyticsResponse;
import com.queueless.backend.admin.dto.OrderAnalyticsResponse;
import com.queueless.backend.admin.dto.ProductAnalyticsResponse;
import com.queueless.backend.admin.dto.ShopAnalyticsResponse;
import com.queueless.backend.admin.dto.TrustAnalyticsResponse;
import com.queueless.backend.admin.dto.UserAnalyticsResponse;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ComplaintRepository complaintRepository;

    @Transactional(readOnly = true)
    public OrderAnalyticsResponse getOrderAnalytics(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("'from' date cannot be after 'to' date");
        }

        long totalOrders;
        long completedOrders;
        long cancelledOrders;
        long rejectedOrders;
        BigDecimal totalOrderValue;

        if (fromDate != null || toDate != null) {
            Instant from = fromDate != null ? fromDate.atStartOfDay(ZoneOffset.UTC).toInstant() : Instant.EPOCH;
            Instant to = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : Instant.now();

            totalOrders = orderRepository.countByCreatedAtBetween(from, to);
            completedOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.COLLECTED, from, to);
            cancelledOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CANCELLED, from, to);
            rejectedOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.REJECTED, from, to);

            BigDecimal collectedSum = orderRepository.sumTotalAmountByStatusAndCreatedAtBetween(OrderStatus.COLLECTED, from, to);
            totalOrderValue = collectedSum != null ? collectedSum : BigDecimal.ZERO;
        } else {
            totalOrders = orderRepository.count();
            completedOrders = orderRepository.countByStatus(OrderStatus.COLLECTED);
            cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
            rejectedOrders = orderRepository.countByStatus(OrderStatus.REJECTED);

            BigDecimal collectedSum = orderRepository.sumTotalAmountByStatus(OrderStatus.COLLECTED);
            totalOrderValue = collectedSum != null ? collectedSum : BigDecimal.ZERO;
        }

        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (completedOrders > 0) {
            averageOrderValue = totalOrderValue.divide(BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP);
        }

        return OrderAnalyticsResponse.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .rejectedOrders(rejectedOrders)
                .totalOrderValue(totalOrderValue)
                .averageOrderValue(averageOrderValue)
                .build();
    }

    @Transactional(readOnly = true)
    public ShopAnalyticsResponse getShopAnalytics() {
        long totalShops = shopRepository.count();
        long activeShops = shopRepository.countByStatus(ShopStatus.ACTIVE);
        long pendingShops = shopRepository.countByStatus(ShopStatus.PENDING);
        long suspendedShops = shopRepository.countByStatus(ShopStatus.SUSPENDED);
        long inactiveShops = shopRepository.countByStatus(ShopStatus.INACTIVE);

        long shopsWithOrders = orderRepository.countDistinctShopsWithOrders();
        long shopsWithoutOrders = Math.max(0, totalShops - shopsWithOrders);

        List<Object[]> topShopRows = orderRepository.findTopShopsByOrderCount(PageRequest.of(0, 10));
        List<ShopAnalyticsResponse.TopShopResponse> topShops = topShopRows.stream()
                .map(row -> ShopAnalyticsResponse.TopShopResponse.builder()
                        .shopId((UUID) row[0])
                        .shopName((String) row[1])
                        .orderCount(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());

        return ShopAnalyticsResponse.builder()
                .totalShops(totalShops)
                .activeShops(activeShops)
                .pendingShops(pendingShops)
                .suspendedShops(suspendedShops)
                .inactiveShops(inactiveShops)
                .shopsWithOrders(shopsWithOrders)
                .shopsWithoutOrders(shopsWithoutOrders)
                .topShops(topShops)
                .build();
    }

    @Transactional(readOnly = true)
    public UserAnalyticsResponse getUserAnalytics() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalShopOwners = userRepository.countByRole(Role.SHOP_OWNER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long suspendedUsers = userRepository.countByAccountStatus(AccountStatus.SUSPENDED);
        long activeUsers = Math.max(0, totalUsers - suspendedUsers);

        return UserAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalShopOwners(totalShopOwners)
                .totalAdmins(totalAdmins)
                .suspendedUsers(suspendedUsers)
                .activeUsers(activeUsers)
                .build();
    }

    @Transactional(readOnly = true)
    public ProductAnalyticsResponse getProductAnalytics() {
        long totalProducts = productRepository.count();
        long availableProducts = productRepository.countByAvailableTrue();
        long unavailableProducts = productRepository.countByAvailableFalse();
        long outOfStockProducts = productRepository.countByStockQuantity(0);

        List<Object[]> topProductRows = orderItemRepository.findTopProductsByQuantitySold(PageRequest.of(0, 10));
        List<ProductAnalyticsResponse.TopProductResponse> topProducts = topProductRows.stream()
                .map(row -> ProductAnalyticsResponse.TopProductResponse.builder()
                        .productId((UUID) row[0])
                        .productName((String) row[1])
                        .totalQuantitySold(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());

        return ProductAnalyticsResponse.builder()
                .totalProducts(totalProducts)
                .availableProducts(availableProducts)
                .unavailableProducts(unavailableProducts)
                .outOfStockProducts(outOfStockProducts)
                .topProducts(topProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public ComplaintAnalyticsResponse getComplaintAnalytics() {
        long totalComplaints = complaintRepository.count();
        long submittedComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReviewComplaints = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);

        long validComplaints = complaintRepository.countByStatus(ComplaintStatus.VALID);
        long invalidComplaints = complaintRepository.countByStatus(ComplaintStatus.INVALID);
        long dismissedComplaints = complaintRepository.countByStatus(ComplaintStatus.DISMISSED);

        List<Object[]> typeRows = complaintRepository.countComplaintsGroupedByType();
        Map<String, Long> byType = new HashMap<>();
        for (Object[] row : typeRows) {
            byType.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        return ComplaintAnalyticsResponse.builder()
                .totalComplaints(totalComplaints)
                .submittedComplaints(submittedComplaints)
                .underReviewComplaints(underReviewComplaints)
                .validComplaints(validComplaints)
                .invalidComplaints(invalidComplaints)
                .dismissedComplaints(dismissedComplaints)
                .byType(byType)
                .build();
    }

    @Transactional(readOnly = true)
    public TrustAnalyticsResponse getTrustAnalytics() {
        long usersWithViolations = userRepository.countByValidComplaintCountGreaterThan(0);
        long suspendedUsers = userRepository.countByAccountStatus(AccountStatus.SUSPENDED);
        long shopsWithViolations = shopRepository.countByValidComplaintCountGreaterThan(0);
        long suspendedShops = shopRepository.countByStatus(ShopStatus.SUSPENDED);

        long totalValidViolations = complaintRepository.countByStatus(ComplaintStatus.VALID);

        List<User> topUsers = userRepository.findTop10ByValidComplaintCountGreaterThanOrderByValidComplaintCountDesc(0);
        List<TrustAnalyticsResponse.UserViolationSummary> topUserViolations = topUsers.stream()
                .map(u -> TrustAnalyticsResponse.UserViolationSummary.builder()
                        .userId(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .validComplaintCount(u.getValidComplaintCount())
                        .build())
                .collect(Collectors.toList());

        List<Shop> topShops = shopRepository.findTop10ByValidComplaintCountGreaterThanOrderByValidComplaintCountDesc(0);
        List<TrustAnalyticsResponse.ShopViolationSummary> topShopViolations = topShops.stream()
                .map(s -> TrustAnalyticsResponse.ShopViolationSummary.builder()
                        .shopId(s.getId())
                        .shopName(s.getShopName())
                        .validComplaintCount(s.getValidComplaintCount())
                        .build())
                .collect(Collectors.toList());

        return TrustAnalyticsResponse.builder()
                .usersWithViolations(usersWithViolations)
                .suspendedUsers(suspendedUsers)
                .shopsWithViolations(shopsWithViolations)
                .suspendedShops(suspendedShops)
                .totalValidViolations(totalValidViolations)
                .topUserViolations(topUserViolations)
                .topShopViolations(topShopViolations)
                .build();
    }
}
