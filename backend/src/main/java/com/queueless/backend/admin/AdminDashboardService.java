package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminDashboardSummaryResponse;
import com.queueless.backend.admin.dto.AdminRecentComplaintPageResponse;
import com.queueless.backend.admin.dto.AdminRecentComplaintResponse;
import com.queueless.backend.admin.dto.AdminRecentOrderPageResponse;
import com.queueless.backend.admin.dto.AdminRecentOrderResponse;
import com.queueless.backend.complaint.Complaint;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ComplaintRepository complaintRepository;

    @Transactional(readOnly = true)
    public AdminDashboardSummaryResponse getSummaryMetrics() {
        // Users
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalShopOwners = userRepository.countByRole(Role.SHOP_OWNER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long suspendedUsers = userRepository.countByAccountStatus(AccountStatus.SUSPENDED);

        AdminDashboardSummaryResponse.UserSummary userSummary = AdminDashboardSummaryResponse.UserSummary.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalShopOwners(totalShopOwners)
                .totalAdmins(totalAdmins)
                .suspendedUsers(suspendedUsers)
                .build();

        // Shops
        long totalShops = shopRepository.count();
        long pendingShops = shopRepository.countByStatus(ShopStatus.PENDING);
        long activeShops = shopRepository.countByStatus(ShopStatus.ACTIVE);
        long suspendedShops = shopRepository.countByStatus(ShopStatus.SUSPENDED);
        long inactiveShops = shopRepository.countByStatus(ShopStatus.INACTIVE);

        AdminDashboardSummaryResponse.ShopSummary shopSummary = AdminDashboardSummaryResponse.ShopSummary.builder()
                .totalShops(totalShops)
                .pendingShops(pendingShops)
                .activeShops(activeShops)
                .suspendedShops(suspendedShops)
                .inactiveShops(inactiveShops)
                .build();

        // Products
        long totalProducts = productRepository.count();
        long availableProducts = productRepository.countByAvailableTrue();
        long unavailableProducts = productRepository.countByAvailableFalse();

        AdminDashboardSummaryResponse.ProductSummary productSummary = AdminDashboardSummaryResponse.ProductSummary.builder()
                .totalProducts(totalProducts)
                .availableProducts(availableProducts)
                .unavailableProducts(unavailableProducts)
                .build();

        // Orders
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long preparingOrders = orderRepository.countByStatus(OrderStatus.PREPARING);
        long readyForPickupOrders = orderRepository.countByStatus(OrderStatus.READY_FOR_PICKUP);
        long collectedOrders = orderRepository.countByStatus(OrderStatus.COLLECTED);
        long rejectedOrders = orderRepository.countByStatus(OrderStatus.REJECTED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        AdminDashboardSummaryResponse.OrderSummary orderSummary = AdminDashboardSummaryResponse.OrderSummary.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .preparingOrders(preparingOrders)
                .readyForPickupOrders(readyForPickupOrders)
                .collectedOrders(collectedOrders)
                .rejectedOrders(rejectedOrders)
                .cancelledOrders(cancelledOrders)
                .build();

        // Complaints
        long totalComplaints = complaintRepository.count();
        long pendingComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long validComplaints = complaintRepository.countByStatus(ComplaintStatus.VALID);
        long invalidComplaints = complaintRepository.countByStatus(ComplaintStatus.INVALID);
        long dismissedComplaints = complaintRepository.countByStatus(ComplaintStatus.DISMISSED);

        AdminDashboardSummaryResponse.ComplaintSummary complaintSummary = AdminDashboardSummaryResponse.ComplaintSummary.builder()
                .totalComplaints(totalComplaints)
                .pendingComplaints(pendingComplaints)
                .validComplaints(validComplaints)
                .invalidComplaints(invalidComplaints)
                .dismissedComplaints(dismissedComplaints)
                .build();

        return AdminDashboardSummaryResponse.builder()
                .users(userSummary)
                .shops(shopSummary)
                .products(productSummary)
                .orders(orderSummary)
                .complaints(complaintSummary)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminRecentOrderPageResponse getRecentOrders(int page, int size) {
        int limitSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, limitSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findAll(pageRequest);

        List<AdminRecentOrderResponse> content = orderPage.getContent().stream()
                .map(AdminRecentOrderResponse::fromEntity)
                .collect(Collectors.toList());

        return AdminRecentOrderPageResponse.builder()
                .content(content)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminRecentComplaintPageResponse getRecentComplaints(int page, int size) {
        int limitSize = Math.min(size, 100);
        PageRequest pageRequest = PageRequest.of(page, limitSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> complaintPage = complaintRepository.findAllByOrderByCreatedAtDesc(pageRequest);

        List<AdminRecentComplaintResponse> content = complaintPage.getContent().stream()
                .map(AdminRecentComplaintResponse::fromEntity)
                .collect(Collectors.toList());

        return AdminRecentComplaintPageResponse.builder()
                .content(content)
                .page(complaintPage.getNumber())
                .size(complaintPage.getSize())
                .totalElements(complaintPage.getTotalElements())
                .totalPages(complaintPage.getTotalPages())
                .hasNext(complaintPage.hasNext())
                .build();
    }
}
