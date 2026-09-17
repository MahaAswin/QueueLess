package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminReportsOverviewResponse;
import com.queueless.backend.admin.dto.ComplaintAnalyticsResponse;
import com.queueless.backend.admin.dto.OrderAnalyticsResponse;
import com.queueless.backend.admin.dto.ProductAnalyticsResponse;
import com.queueless.backend.admin.dto.ShopAnalyticsResponse;
import com.queueless.backend.admin.dto.TrustAnalyticsResponse;
import com.queueless.backend.admin.dto.UserAnalyticsResponse;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
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

    @Transactional(readOnly = true)
    public AdminReportsOverviewResponse getReportsOverview(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("'from' date cannot be after 'to' date");
        }

        Instant from = fromDate != null ? fromDate.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant to = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        // Platform entity totals
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalShopOwners = userRepository.countByRole(Role.SHOP_OWNER);
        long suspendedUsers = userRepository.countByAccountStatus(AccountStatus.SUSPENDED);

        long totalShops = shopRepository.count();
        long activeShops = shopRepository.countByStatus(ShopStatus.ACTIVE);
        long pendingShops = shopRepository.countByStatus(ShopStatus.PENDING);
        long suspendedShops = shopRepository.countByStatus(ShopStatus.SUSPENDED);

        // Order aggregates within date window
        List<Object[]> statusRows = (from != null && to != null)
                ? orderRepository.findOrderStatusAggregatesBetween(from, to)
                : orderRepository.findAllOrderStatusAggregates();
        Map<OrderStatus, Long> countByStatus = new HashMap<>();
        Map<OrderStatus, BigDecimal> valueByStatus = new HashMap<>();

        long totalOrders = 0;
        BigDecimal totalOrderValue = BigDecimal.ZERO;

        for (Object[] row : statusRows) {
            OrderStatus status = (OrderStatus) row[0];
            long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal val = toBigDecimal(row[2]);

            countByStatus.put(status, count);
            valueByStatus.put(status, val);

            totalOrders += count;
            totalOrderValue = totalOrderValue.add(val);
        }

        long completedOrders = countByStatus.getOrDefault(OrderStatus.COLLECTED, 0L);
        long cancelledOrders = countByStatus.getOrDefault(OrderStatus.CANCELLED, 0L);
        long rejectedOrders = countByStatus.getOrDefault(OrderStatus.REJECTED, 0L);
        long pendingOrders = countByStatus.getOrDefault(OrderStatus.PENDING, 0L)
                + countByStatus.getOrDefault(OrderStatus.CONFIRMED, 0L)
                + countByStatus.getOrDefault(OrderStatus.PREPARING, 0L)
                + countByStatus.getOrDefault(OrderStatus.READY_FOR_PICKUP, 0L);

        BigDecimal collectedOrderValue = valueByStatus.getOrDefault(OrderStatus.COLLECTED, BigDecimal.ZERO);
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (completedOrders > 0) {
            averageOrderValue = collectedOrderValue.divide(BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP);
        } else if (totalOrders > 0) {
            averageOrderValue = totalOrderValue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }

        // Order Status Distribution DTOs
        List<AdminReportsOverviewResponse.OrderStatusMetric> orderStatusDistribution = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = countByStatus.getOrDefault(status, 0L);
            BigDecimal val = valueByStatus.getOrDefault(status, BigDecimal.ZERO);
            double pct = totalOrders > 0 ? (double) count / totalOrders * 100.0 : 0.0;

            orderStatusDistribution.add(AdminReportsOverviewResponse.OrderStatusMetric.builder()
                    .status(status.name())
                    .count(count)
                    .totalValue(val)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        // Time Series Trends (Chronological)
        List<Order> ordersForTrend = (from != null && to != null)
                ? orderRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(from, to)
                : orderRepository.findAllByOrderByCreatedAtAsc();

        Map<LocalDate, TimeSeriesAccumulator> timeSeriesMap = new TreeMap<>();

        // If date range specified, pre-populate dates
        if (fromDate != null && toDate != null) {
            LocalDate curr = fromDate;
            while (!curr.isAfter(toDate)) {
                timeSeriesMap.put(curr, new TimeSeriesAccumulator());
                curr = curr.plusDays(1);
            }
        }

        for (Order o : ordersForTrend) {
            LocalDate date = o.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
            TimeSeriesAccumulator acc = timeSeriesMap.computeIfAbsent(date, k -> new TimeSeriesAccumulator());
            acc.orderCount++;
            if (o.getStatus() == OrderStatus.COLLECTED) {
                acc.completedCount++;
            } else if (o.getStatus() == OrderStatus.CANCELLED || o.getStatus() == OrderStatus.REJECTED) {
                acc.cancelledCount++;
            }
            if (o.getTotalAmount() != null) {
                acc.orderValue = acc.orderValue.add(o.getTotalAmount());
            }
        }

        List<AdminReportsOverviewResponse.TimeSeriesPoint> timeSeriesPoints = new ArrayList<>();
        for (Map.Entry<LocalDate, TimeSeriesAccumulator> entry : timeSeriesMap.entrySet()) {
            timeSeriesPoints.add(AdminReportsOverviewResponse.TimeSeriesPoint.builder()
                    .date(entry.getKey().toString())
                    .orderCount(entry.getValue().orderCount)
                    .completedCount(entry.getValue().completedCount)
                    .cancelledCount(entry.getValue().cancelledCount)
                    .orderValue(entry.getValue().orderValue)
                    .build());
        }

        // Top Performing Shops
        List<Object[]> topShopRows = (from != null && to != null)
                ? orderRepository.findTopShopsPerformanceBetween(from, to, PageRequest.of(0, 10))
                : orderRepository.findAllTopShopsPerformance(PageRequest.of(0, 10));
        List<AdminReportsOverviewResponse.TopShopMetric> topShops = new ArrayList<>();
        for (Object[] row : topShopRows) {
            UUID shopId = (UUID) row[0];
            String shopName = (String) row[1];
            ShopCategory category = (ShopCategory) row[2];
            ShopStatus status = (ShopStatus) row[3];
            int validComplaintCount = row[4] != null ? ((Number) row[4]).intValue() : 0;
            long shopTotalOrders = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            long shopCompletedOrders = row[6] != null ? ((Number) row[6]).longValue() : 0L;
            long shopCancelledOrders = row[7] != null ? ((Number) row[7]).longValue() : 0L;
            BigDecimal shopTotalValue = toBigDecimal(row[8]);

            topShops.add(AdminReportsOverviewResponse.TopShopMetric.builder()
                    .shopId(shopId)
                    .shopName(shopName)
                    .category(category != null ? category.name() : "GENERAL")
                    .status(status != null ? status.name() : "ACTIVE")
                    .validComplaintCount(validComplaintCount)
                    .totalOrders(shopTotalOrders)
                    .completedOrders(shopCompletedOrders)
                    .cancelledOrders(shopCancelledOrders)
                    .totalOrderValue(shopTotalValue)
                    .build());
        }

        // Complaints breakdown
        long totalComplaints = complaintRepository.count();
        long submittedComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReviewComplaints = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        long validComplaints = complaintRepository.countByStatus(ComplaintStatus.VALID);
        long invalidComplaints = complaintRepository.countByStatus(ComplaintStatus.INVALID);
        long dismissedComplaints = complaintRepository.countByStatus(ComplaintStatus.DISMISSED);

        long pendingComplaints = submittedComplaints + underReviewComplaints;
        long resolvedComplaints = validComplaints + invalidComplaints + dismissedComplaints;

        Map<String, Long> complaintsByStatus = new LinkedHashMap<>();
        complaintsByStatus.put("SUBMITTED", submittedComplaints);
        complaintsByStatus.put("UNDER_REVIEW", underReviewComplaints);
        complaintsByStatus.put("VALID", validComplaints);
        complaintsByStatus.put("INVALID", invalidComplaints);
        complaintsByStatus.put("DISMISSED", dismissedComplaints);

        List<Object[]> typeRows = complaintRepository.countComplaintsGroupedByType();
        Map<String, Long> complaintsByType = new LinkedHashMap<>();
        for (Object[] row : typeRows) {
            complaintsByType.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        // User role distribution
        Map<String, Long> userRoleDistribution = new LinkedHashMap<>();
        userRoleDistribution.put("CUSTOMER", totalCustomers);
        userRoleDistribution.put("SHOP_OWNER", totalShopOwners);
        userRoleDistribution.put("ADMIN", userRepository.countByRole(Role.ADMIN));

        AdminReportsOverviewResponse.OverviewMetrics overview = AdminReportsOverviewResponse.OverviewMetrics.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalShopOwners(totalShopOwners)
                .totalShops(totalShops)
                .activeShops(activeShops)
                .pendingShops(pendingShops)
                .suspendedShops(suspendedShops)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .pendingOrders(pendingOrders)
                .totalOrderValue(totalOrderValue)
                .collectedOrderValue(collectedOrderValue)
                .averageOrderValue(averageOrderValue)
                .totalComplaints(totalComplaints)
                .pendingComplaints(pendingComplaints)
                .resolvedComplaints(resolvedComplaints)
                .build();

        return AdminReportsOverviewResponse.builder()
                .overview(overview)
                .orderStatusDistribution(orderStatusDistribution)
                .ordersOverTime(timeSeriesPoints)
                .topShops(topShops)
                .complaintsByType(complaintsByType)
                .complaintsByStatus(complaintsByStatus)
                .userRoleDistribution(userRoleDistribution)
                .build();
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj == null) {
            return BigDecimal.ZERO;
        }
        if (obj instanceof BigDecimal) {
            return (BigDecimal) obj;
        }
        if (obj instanceof Number) {
            return BigDecimal.valueOf(((Number) obj).doubleValue());
        }
        try {
            return new BigDecimal(obj.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private static class TimeSeriesAccumulator {
        long orderCount = 0;
        long completedCount = 0;
        long cancelledCount = 0;
        BigDecimal orderValue = BigDecimal.ZERO;
    }
}
