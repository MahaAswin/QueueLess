package com.queueless.backend.qr;

import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.common.PickupTokenNotFoundException;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.qr.dto.PickupQrResponse;
import com.queueless.backend.qr.dto.PickupVerificationRequest;
import com.queueless.backend.qr.dto.PickupVerificationResponse;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PickupVerificationService {

    private final PickupTokenRepository pickupTokenRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${queueless.qr.expiration-minutes:30}")
    private int expirationMinutes;

    @Transactional
    public PickupQrResponse getPickupQR(UUID orderId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to view pickup QR for this order");
        }

        if (order.getStatus() == OrderStatus.COLLECTED) {
            throw new IllegalStateException("Order has already been collected");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is cancelled");
        }

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("QR code can only be generated for orders that are READY_FOR_PICKUP");
        }

        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(expirationMinutes);

        Optional<PickupToken> existingTokenOpt = pickupTokenRepository.findByOrder(order);
        PickupToken pickupToken;
        if (existingTokenOpt.isPresent()) {
            pickupToken = existingTokenOpt.get();
            pickupToken.setTokenHash(tokenHash);
            pickupToken.setExpiresAt(expiresAt);
            pickupToken.setUsed(false);
            pickupToken.setUsedAt(null);
        } else {
            pickupToken = PickupToken.builder()
                    .order(order)
                    .tokenHash(tokenHash)
                    .expiresAt(expiresAt)
                    .used(false)
                    .build();
        }

        pickupTokenRepository.save(pickupToken);

        return PickupQrResponse.builder()
                .orderId(order.getId())
                .pickupToken(rawToken)
                .expiresAt(expiresAt)
                .build();
    }

    @Transactional
    public PickupVerificationResponse verifyPickup(PickupVerificationRequest request, String currentUserEmail) {
        User owner = getShopOwnerUser(currentUserEmail);

        String rawToken = request.getPickupToken();
        if (rawToken == null || !rawToken.startsWith("QLP:")) {
            throw new PickupTokenNotFoundException("Invalid pickup token format");
        }

        String tokenHash = hashToken(rawToken);

        PickupToken token = pickupTokenRepository.findByTokenHashWithLock(tokenHash)
                .orElseThrow(() -> new PickupTokenNotFoundException("Invalid or non-existent pickup token"));

        if (token.isUsed()) {
            throw new IllegalStateException("Order has already been collected.");
        }

        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new IllegalStateException("Pickup token has expired");
        }

        Order order = token.getOrder();

        if (!order.getShop().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to verify pickups for another shop");
        }

        if (order.getStatus() == OrderStatus.COLLECTED) {
            throw new IllegalStateException("Order has already been collected.");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is cancelled");
        }

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("Order is not ready for pickup");
        }

        LocalDateTime now = LocalDateTime.now();
        token.setUsed(true);
        token.setUsedAt(now);
        order.setStatus(OrderStatus.COLLECTED);

        pickupTokenRepository.save(token);
        orderRepository.save(order);

        return PickupVerificationResponse.builder()
                .success(true)
                .message("Pickup verified successfully")
                .orderId(order.getId())
                .status(OrderStatus.COLLECTED)
                .shopName(order.getShop().getShopName())
                .collectedAt(now)
                .build();
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return "QLP:" + HexFormat.of().formatHex(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private User getCustomerUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only CUSTOMER users can perform customer QR operations");
        }
        return user;
    }

    private User getShopOwnerUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        if (user.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Only SHOP_OWNER users can perform pickup verification");
        }
        return user;
    }
}
