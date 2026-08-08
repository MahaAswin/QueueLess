package com.queueless.backend.order;

import com.queueless.backend.cart.Cart;
import com.queueless.backend.cart.CartItem;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.common.ProductNotFoundException;
import com.queueless.backend.notification.NotificationService;
import com.queueless.backend.notification.NotificationType;
import com.queueless.backend.order.dto.OrderPageResponse;
import com.queueless.backend.order.dto.OrderResponse;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.PickupSlotStatus;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final PickupSlotRepository pickupSlotRepository;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponse checkout(String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new IllegalArgumentException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Shop targetShop = null;
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + cartItem.getProduct().getId()));

            if (Boolean.FALSE.equals(product.getAvailable()) || product.getStockQuantity() <= 0) {
                throw new IllegalArgumentException("Product is unavailable: " + product.getName());
            }

            if (product.getShop().getStatus() == com.queueless.backend.shop.ShopStatus.SUSPENDED) {
                throw new IllegalStateException("Suspended shop cannot receive new orders");
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            if (targetShop == null) {
                targetShop = product.getShop();
            } else if (!targetShop.getId().equals(product.getShop().getId())) {
                throw new IllegalArgumentException("Cart can contain products from only one shop.");
            }

            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemSubtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .unitPriceSnapshot(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .subtotal(itemSubtotal)
                    .build();

            orderItems.add(orderItem);

            // Deduct stock
            int updatedStock = product.getStockQuantity() - cartItem.getQuantity();
            product.setStockQuantity(updatedStock);
            if (updatedStock == 0) {
                product.setAvailable(false);
            }
            productRepository.save(product);
        }

        order.setShop(targetShop);
        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        notificationService.createNotification(
                targetShop.getOwner(),
                NotificationType.ORDER_PLACED,
                "New Order",
                "You have received a new order.",
                savedOrder.getId(),
                targetShop.getId()
        );

        return toOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderPageResponse getCustomerOrders(String currentUserEmail, int page, int size) {
        User customer = getCustomerUser(currentUserEmail);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByCustomer(customer, pageRequest);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        return OrderPageResponse.builder()
                .content(content)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getCustomerOrderById(UUID orderId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to view this order");
        }

        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID orderId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        restoreStockForOrder(order);

        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                updatedOrder.getShop().getOwner(),
                NotificationType.ORDER_CANCELLED,
                "Order Cancelled",
                "An order was cancelled by customer.",
                updatedOrder.getId(),
                updatedOrder.getShop().getId()
        );

        return toOrderResponse(updatedOrder);
    }

    @Transactional(readOnly = true)
    public OrderPageResponse getShopOrders(String currentUserEmail, OrderStatus status, int page, int size) {
        User owner = getShopOwnerUser(currentUserEmail);
        List<Shop> shops = shopRepository.findByOwner(owner);

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findByShopInAndStatus(shops, status, pageRequest);
        } else {
            orderPage = orderRepository.findByShopIn(shops, pageRequest);
        }

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        return OrderPageResponse.builder()
                .content(content)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getShopOrders(String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);

        return orderRepository.findAll().stream()
                .filter(order -> order.getShop().getOwner().getId().equals(owner.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getShopOrderById(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to view orders for this shop");
        }

        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse confirmOrder(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to manage orders for this shop");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be confirmed. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CONFIRMED);
        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                updatedOrder.getCustomer(),
                NotificationType.ORDER_CONFIRMED,
                "Order Confirmed",
                "Your order has been confirmed.",
                updatedOrder.getId(),
                updatedOrder.getShop().getId()
        );

        return toOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse rejectOrder(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to manage orders for this shop");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be rejected. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.REJECTED);
        restoreStockForOrder(order);

        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                updatedOrder.getCustomer(),
                NotificationType.ORDER_REJECTED,
                "Order Rejected",
                "Your order was rejected.",
                updatedOrder.getId(),
                updatedOrder.getShop().getId()
        );

        return toOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse startPreparing(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to manage orders for this shop");
        }

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Only CONFIRMED orders can be moved to PREPARING. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.PREPARING);
        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                updatedOrder.getCustomer(),
                NotificationType.ORDER_PREPARING,
                "Order Preparation Started",
                "Your order is now being prepared.",
                updatedOrder.getId(),
                updatedOrder.getShop().getId()
        );

        return toOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse markOrderReadyForPickup(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to manage orders for this shop");
        }

        if (order.getStatus() != OrderStatus.PREPARING) {
            throw new IllegalStateException("Only PREPARING orders can be marked READY_FOR_PICKUP. Current status: " + order.getStatus());
        }

        Optional<PickupSlot> slotOpt = pickupSlotRepository.findByOrder(order);
        if (slotOpt.isPresent()) {
            PickupSlot slot = slotOpt.get();
            if (slot.getStatus() != PickupSlotStatus.ACCEPTED && slot.getStatus() != PickupSlotStatus.CUSTOMER_ACCEPTED) {
                throw new IllegalStateException("Cannot mark order READY_FOR_PICKUP without a confirmed pickup slot. Current slot status: " + slot.getStatus());
            }
        }

        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        Order updatedOrder = orderRepository.save(order);

        notificationService.createNotification(
                updatedOrder.getCustomer(),
                NotificationType.ORDER_READY_FOR_PICKUP,
                "Order Ready for Pickup",
                "Your order is ready for pickup.",
                updatedOrder.getId(),
                updatedOrder.getShop().getId()
        );

        return toOrderResponse(updatedOrder);
    }

    private OrderResponse toOrderResponse(Order order) {
        PickupSlotResponse slotResponse = pickupSlotRepository.findByOrder(order)
                .map(PickupSlotResponse::fromEntity)
                .orElse(null);
        return OrderResponse.fromEntity(order, slotResponse);
    }

    private void restoreStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            productRepository.findByIdWithLock(item.getProduct().getId()).ifPresent(product -> {
                int restoredStock = product.getStockQuantity() + item.getQuantity();
                product.setStockQuantity(restoredStock);
                if (restoredStock > 0) {
                    product.setAvailable(true);
                }
                productRepository.save(product);
            });
        }
    }

    private User getCustomerUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only CUSTOMER users can perform customer order operations");
        }
        return user;
    }

    private User getShopOwnerUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Only SHOP_OWNER users can perform shop order operations");
        }
        return user;
    }

    private Order getOrderEntityById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
    }
}
