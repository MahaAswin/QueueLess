package com.queueless.backend.order;

import com.queueless.backend.cart.Cart;
import com.queueless.backend.cart.CartItem;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.common.ProductNotFoundException;
import com.queueless.backend.order.dto.OrderResponse;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.queueless.backend.notification.NotificationService;

import com.queueless.backend.notification.NotificationType;

@Service
@RequiredArgsConstructor
public class OrderService {


    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
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

        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getCustomerOrderById(UUID orderId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to view this order");
        }

        return OrderResponse.fromEntity(order);
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

        return OrderResponse.fromEntity(updatedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getShopOrders(String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);

        return orderRepository.findAll().stream()
                .filter(order -> order.getShop().getOwner().getId().equals(owner.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getShopOrderById(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to view orders for this shop");
        }

        return OrderResponse.fromEntity(order);
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

        return OrderResponse.fromEntity(updatedOrder);
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

        return OrderResponse.fromEntity(updatedOrder);
    }

    @Transactional
    public OrderResponse markOrderReadyForPickup(UUID orderId, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);
        Order order = getOrderEntityById(orderId);

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to manage orders for this shop");
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REJECTED || order.getStatus() == OrderStatus.COLLECTED) {
            throw new IllegalStateException("Cannot set order to READY_FOR_PICKUP from status: " + order.getStatus());
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

        return OrderResponse.fromEntity(updatedOrder);
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
