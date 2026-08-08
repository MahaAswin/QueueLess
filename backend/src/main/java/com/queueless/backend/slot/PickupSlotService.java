package com.queueless.backend.slot;

import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.common.PickupSlotNotFoundException;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.slot.dto.CounterProposalRequest;
import com.queueless.backend.slot.dto.CreatePickupSlotRequest;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.queueless.backend.notification.NotificationService;
import com.queueless.backend.notification.NotificationType;

@Service
@RequiredArgsConstructor
public class PickupSlotService {

    private final PickupSlotRepository pickupSlotRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public PickupSlotResponse requestPickupSlot(UUID orderId, CreatePickupSlotRequest request, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to request a pickup slot for this order");
        }

        validateOrderEligibilityForSlot(order);

        Optional<PickupSlot> existingSlot = pickupSlotRepository.findByOrder(order);
        if (existingSlot.isPresent() && isActiveStatus(existingSlot.get().getStatus())) {
            throw new IllegalArgumentException("Active pickup slot already exists for this order");
        }

        validateSlotTime(request.getPickupDate(), request.getStartTime(), request.getEndTime(), order.getShop());
        validateShopWorkloadAndCapacity(order.getShop(), request.getPickupDate(), request.getStartTime(), request.getEndTime());

        PickupSlot slot = PickupSlot.builder()
                .order(order)
                .pickupDate(request.getPickupDate())
                .requestedStartTime(request.getStartTime())
                .requestedEndTime(request.getEndTime())
                .status(PickupSlotStatus.REQUESTED)
                .build();

        PickupSlot savedSlot = pickupSlotRepository.save(slot);

        notificationService.createNotification(
                order.getShop().getOwner(),
                NotificationType.PICKUP_SLOT_REQUESTED,
                "Pickup Slot Requested",
                "Customer requested a pickup slot.",
                order.getId(),
                order.getShop().getId()
        );

        return PickupSlotResponse.fromEntity(savedSlot);
    }

    @Transactional
    public PickupSlotResponse acceptSlot(UUID slotId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        PickupSlot slot = getPickupSlotEntityById(slotId);

        verifyShopOwnerAccess(slot.getOrder().getShop(), owner, "accept");

        if (slot.getStatus() != PickupSlotStatus.REQUESTED) {
            throw new IllegalStateException("Cannot accept pickup slot in status: " + slot.getStatus());
        }

        slot.setStatus(PickupSlotStatus.ACCEPTED);
        PickupSlot savedSlot = pickupSlotRepository.save(slot);

        notificationService.createNotification(
                slot.getOrder().getCustomer(),
                NotificationType.PICKUP_SLOT_ACCEPTED,
                "Pickup Slot Accepted",
                "Shop accepted your requested pickup slot.",
                slot.getOrder().getId(),
                slot.getOrder().getShop().getId()
        );

        return PickupSlotResponse.fromEntity(savedSlot);
    }

    @Transactional
    public PickupSlotResponse rejectSlot(UUID slotId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        PickupSlot slot = getPickupSlotEntityById(slotId);

        verifyShopOwnerAccess(slot.getOrder().getShop(), owner, "reject");

        if (slot.getStatus() != PickupSlotStatus.REQUESTED && slot.getStatus() != PickupSlotStatus.COUNTER_PROPOSED) {
            throw new IllegalStateException("Cannot reject pickup slot in status: " + slot.getStatus());
        }

        slot.setStatus(PickupSlotStatus.SHOP_REJECTED);
        PickupSlot savedSlot = pickupSlotRepository.save(slot);

        notificationService.createNotification(
                slot.getOrder().getCustomer(),
                NotificationType.PICKUP_SLOT_REJECTED,
                "Pickup Slot Rejected",
                "Shop rejected your requested pickup slot.",
                slot.getOrder().getId(),
                slot.getOrder().getShop().getId()
        );

        return PickupSlotResponse.fromEntity(savedSlot);
    }

    @Transactional
    public PickupSlotResponse counterPropose(UUID slotId, CounterProposalRequest request, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        PickupSlot slot = getPickupSlotEntityById(slotId);

        verifyShopOwnerAccess(slot.getOrder().getShop(), owner, "counter-propose for");

        if (slot.getStatus() != PickupSlotStatus.REQUESTED) {
            throw new IllegalStateException("Cannot counter-propose pickup slot in status: " + slot.getStatus());
        }

        Shop shop = slot.getOrder().getShop();
        validateSlotTime(request.getPickupDate(), request.getStartTime(), request.getEndTime(), shop);
        validateShopWorkloadAndCapacity(shop, request.getPickupDate(), request.getStartTime(), request.getEndTime());

        slot.setProposedDate(request.getPickupDate());
        slot.setProposedStartTime(request.getStartTime());
        slot.setProposedEndTime(request.getEndTime());
        slot.setStatus(PickupSlotStatus.COUNTER_PROPOSED);

        PickupSlot savedSlot = pickupSlotRepository.save(slot);

        notificationService.createNotification(
                slot.getOrder().getCustomer(),
                NotificationType.PICKUP_SLOT_COUNTER_PROPOSED,
                "Pickup Slot Counter-Proposed",
                "Shop proposed a different pickup slot.",
                slot.getOrder().getId(),
                shop.getId()
        );

        return PickupSlotResponse.fromEntity(savedSlot);
    }

    @Transactional
    public PickupSlotResponse customerAccept(UUID slotId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        PickupSlot slot = getPickupSlotEntityById(slotId);

        if (!slot.getOrder().getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to respond to this counter-proposal");
        }

        if (slot.getStatus() != PickupSlotStatus.COUNTER_PROPOSED) {
            throw new IllegalStateException("Cannot accept counter-proposal in status: " + slot.getStatus());
        }

        slot.setStatus(PickupSlotStatus.CUSTOMER_ACCEPTED);
        PickupSlot savedSlot = pickupSlotRepository.save(slot);

        notificationService.createNotification(
                slot.getOrder().getShop().getOwner(),
                NotificationType.PICKUP_SLOT_CUSTOMER_ACCEPTED,
                "Counter-Proposal Accepted",
                "Customer accepted your counter-proposal.",
                slot.getOrder().getId(),
                slot.getOrder().getShop().getId()
        );

        return PickupSlotResponse.fromEntity(savedSlot);
    }

    @Transactional
    public PickupSlotResponse customerReject(UUID slotId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        PickupSlot slot = getPickupSlotEntityById(slotId);

        if (!slot.getOrder().getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to respond to this counter-proposal");
        }

        if (slot.getStatus() != PickupSlotStatus.COUNTER_PROPOSED) {
            throw new IllegalStateException("Cannot reject counter-proposal in status: " + slot.getStatus());
        }

        slot.setStatus(PickupSlotStatus.CUSTOMER_REJECTED);
        PickupSlot savedSlot = pickupSlotRepository.save(slot);

        notificationService.createNotification(
                slot.getOrder().getShop().getOwner(),
                NotificationType.PICKUP_SLOT_CUSTOMER_REJECTED,
                "Counter-Proposal Rejected",
                "Customer rejected your counter-proposal.",
                slot.getOrder().getId(),
                slot.getOrder().getShop().getId()
        );

        return PickupSlotResponse.fromEntity(savedSlot);
    }


    @Transactional(readOnly = true)
    public PickupSlotResponse getSlotByOrder(UUID orderId, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        boolean isCustomer = order.getCustomer().getId().equals(user.getId());
        boolean isOwner = order.getShop().getOwner().getId().equals(user.getId());

        if (!isCustomer && !isOwner) {
            throw new AccessDeniedException("You are not authorized to view pickup slot for this order");
        }

        PickupSlot slot = pickupSlotRepository.findByOrder(order)
                .orElseThrow(() -> new PickupSlotNotFoundException("No pickup slot found for order ID: " + orderId));

        return PickupSlotResponse.fromEntity(slot);
    }

    @Transactional(readOnly = true)
    public List<PickupSlotResponse> getShopPickupSlots(String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);

        return pickupSlotRepository.findAll().stream()
                .filter(slot -> slot.getOrder().getShop().getOwner().getId().equals(owner.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(PickupSlotResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private User getCustomerUser(String email) {
        User user = getUserByEmail(email);
        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only CUSTOMER users can perform customer pickup slot operations");
        }
        return user;
    }

    private User getShopOwnerUser(String email) {
        User user = getUserByEmail(email);
        if (user.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Only SHOP_OWNER users can perform shop pickup slot operations");
        }
        return user;
    }

    private PickupSlot getPickupSlotEntityById(UUID slotId) {
        return pickupSlotRepository.findById(slotId)
                .orElseThrow(() -> new PickupSlotNotFoundException("Pickup slot not found with ID: " + slotId));
    }

    private void verifyShopOwnerAccess(Shop shop, User owner, String action) {
        if (!shop.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to " + action + " pickup slot for this shop");
        }
    }

    private void validateOrderEligibilityForSlot(Order order) {
        OrderStatus status = order.getStatus();
        if (status == OrderStatus.COLLECTED || status == OrderStatus.CANCELLED || status == OrderStatus.REJECTED) {
            throw new IllegalStateException("Pickup slot cannot be scheduled for order in status: " + status);
        }
    }

    private boolean isActiveStatus(PickupSlotStatus status) {
        return status == PickupSlotStatus.REQUESTED
                || status == PickupSlotStatus.COUNTER_PROPOSED
                || status == PickupSlotStatus.ACCEPTED
                || status == PickupSlotStatus.CUSTOMER_ACCEPTED;
    }

    private void validateSlotTime(LocalDate date, LocalTime start, LocalTime end, Shop shop) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Pickup date cannot be in the past");
        }

        if (start.isBefore(shop.getOpeningTime()) || end.isAfter(shop.getClosingTime())) {
            throw new IllegalArgumentException("Pickup time must be within shop operating hours: "
                    + shop.getOpeningTime() + " - " + shop.getClosingTime());
        }
    }

    /**
     * Extension point for future workload/capacity management.
     */
    private void validateShopWorkloadAndCapacity(Shop shop, LocalDate date, LocalTime startTime, LocalTime endTime) {
        // Reserved for future workload algorithm (e.g. max orders per slot window)
    }
}
