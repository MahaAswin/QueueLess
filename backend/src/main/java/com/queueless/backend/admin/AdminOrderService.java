package com.queueless.backend.admin;

import com.queueless.backend.admin.dto.AdminOrderDetailResponse;
import com.queueless.backend.admin.dto.AdminOrderPageResponse;
import com.queueless.backend.admin.dto.AdminOrderResponse;
import com.queueless.backend.admin.dto.AdminOrderSummaryResponse;
import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final PickupSlotRepository pickupSlotRepository;

    @Transactional(readOnly = true)
    public AdminOrderPageResponse getAdminOrders(
            OrderStatus status,
            UUID shopId,
            Instant from,
            Instant to,
            String search,
            int page,
            int size) {

        int limitSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageRequest = PageRequest.of(page, limitSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Order> orderPage = orderRepository.findAll(
                com.queueless.backend.order.OrderSpecifications.withAdminFilters(status, shopId, from, to, cleanSearch),
                pageRequest
        );

        List<AdminOrderResponse> content = orderPage.getContent().stream()
                .map(this::toAdminOrderResponse)
                .collect(Collectors.toList());

        return AdminOrderPageResponse.builder()
                .content(content)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getAdminOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        PickupSlotResponse slotResponse = pickupSlotRepository.findByOrder(order)
                .map(PickupSlotResponse::fromEntity)
                .orElse(null);

        return AdminOrderDetailResponse.fromEntity(order, slotResponse);
    }

    @Transactional(readOnly = true)
    public AdminOrderSummaryResponse getOrderSummary() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long preparingOrders = orderRepository.countByStatus(OrderStatus.PREPARING);
        long readyForPickupOrders = orderRepository.countByStatus(OrderStatus.READY_FOR_PICKUP);
        long collectedOrders = orderRepository.countByStatus(OrderStatus.COLLECTED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long rejectedOrders = orderRepository.countByStatus(OrderStatus.REJECTED);

        BigDecimal collectedRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.COLLECTED);
        BigDecimal confirmedRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.CONFIRMED);
        BigDecimal preparingRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.PREPARING);
        BigDecimal readyRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.READY_FOR_PICKUP);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        if (collectedRevenue != null) totalRevenue = totalRevenue.add(collectedRevenue);
        if (confirmedRevenue != null) totalRevenue = totalRevenue.add(confirmedRevenue);
        if (preparingRevenue != null) totalRevenue = totalRevenue.add(preparingRevenue);
        if (readyRevenue != null) totalRevenue = totalRevenue.add(readyRevenue);

        return AdminOrderSummaryResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .preparingOrders(preparingOrders)
                .readyForPickupOrders(readyForPickupOrders)
                .collectedOrders(collectedOrders)
                .cancelledOrders(cancelledOrders)
                .rejectedOrders(rejectedOrders)
                .totalRevenue(totalRevenue)
                .build();
    }

    private AdminOrderResponse toAdminOrderResponse(Order order) {
        PickupSlotResponse slotResponse = pickupSlotRepository.findByOrder(order)
                .map(PickupSlotResponse::fromEntity)
                .orElse(null);

        return AdminOrderResponse.fromEntity(order, slotResponse);
    }
}
