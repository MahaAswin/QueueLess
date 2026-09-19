package com.queueless.backend.otp;

import com.queueless.backend.common.OrderNotFoundException;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.order.dto.OrderItemResponse;
import com.queueless.backend.otp.dto.CustomerPickupOtpResponse;
import com.queueless.backend.otp.dto.ShopVerifyOtpRequest;
import com.queueless.backend.otp.dto.ShopVerifiedPickupResponse;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.dto.PickupSlotResponse;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PickupOtpService {

    private final PickupOtpRepository pickupOtpRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PickupSlotRepository pickupSlotRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${queueless.otp.expiration-minutes:15}")
    private int defaultOtpExpirationMinutes;

    @Value("${queueless.otp.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${queueless.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Transactional
    public CustomerPickupOtpResponse getOrGenerateCustomerOtp(UUID orderId, String customerEmail) {
        User customer = getCustomerUser(customerEmail);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to view pickup OTP for this order");
        }

        if (order.getStatus() == OrderStatus.COLLECTED) {
            throw new IllegalStateException("Order has already been collected");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is cancelled");
        }

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("OTP can only be generated for orders that are READY_FOR_PICKUP");
        }

        LocalDateTime now = LocalDateTime.now();
        Optional<PickupOtp> existingOtpOpt = pickupOtpRepository.findByOrder(order);

        // If an active, unexpired, unconsumed, unlocked OTP already exists, reuse it without regenerating
        if (existingOtpOpt.isPresent()) {
            PickupOtp existing = existingOtpOpt.get();
            if (!existing.isConsumed() && existing.getExpiresAt().isAfter(now) && existing.getFailedAttempts() < maxFailedAttempts) {
                String plainOtp = decryptOtp(existing.getEncryptedOtp());
                return CustomerPickupOtpResponse.builder()
                        .orderId(order.getId())
                        .otp(plainOtp)
                        .expiresAt(existing.getExpiresAt())
                        .status(order.getStatus())
                        .shopName(order.getShop().getShopName())
                        .build();
            }
        }

        // Generate a new secure 6-digit OTP
        String rawOtp = String.format("%06d", secureRandom.nextInt(1000000));
        String salt = generateSalt();
        String otpHash = hashOtp(rawOtp, salt);
        String encryptedOtp = encryptOtp(rawOtp);
        LocalDateTime expiresAt = now.plusMinutes(defaultOtpExpirationMinutes);

        PickupOtp pickupOtp;
        if (existingOtpOpt.isPresent()) {
            pickupOtp = existingOtpOpt.get();
            pickupOtp.setOtpHash(otpHash);
            pickupOtp.setSalt(salt);
            pickupOtp.setEncryptedOtp(encryptedOtp);
            pickupOtp.setExpiresAt(expiresAt);
            pickupOtp.setVerified(false);
            pickupOtp.setVerifiedAt(null);
            pickupOtp.setConsumed(false);
            pickupOtp.setConsumedAt(null);
            pickupOtp.setFailedAttempts(0);
        } else {
            pickupOtp = PickupOtp.builder()
                    .order(order)
                    .otpHash(otpHash)
                    .salt(salt)
                    .encryptedOtp(encryptedOtp)
                    .expiresAt(expiresAt)
                    .verified(false)
                    .consumed(false)
                    .failedAttempts(0)
                    .build();
        }

        pickupOtpRepository.save(pickupOtp);

        return CustomerPickupOtpResponse.builder()
                .orderId(order.getId())
                .otp(rawOtp)
                .expiresAt(expiresAt)
                .status(order.getStatus())
                .shopName(order.getShop().getShopName())
                .build();
    }

    @Transactional
    public ShopVerifiedPickupResponse verifyPickupOtp(ShopVerifyOtpRequest request, String shopOwnerEmail) {
        User owner = getShopOwnerUser(shopOwnerEmail);

        String rawOtp = request.getOtp();
        if (rawOtp == null || !rawOtp.matches("^[0-9]{6}$")) {
            throw new IllegalArgumentException("OTP must be exactly 6 numeric digits");
        }

        List<Shop> ownerShops = shopRepository.findByOwner(owner);
        List<UUID> ownerShopIds = ownerShops.stream().map(Shop::getId).collect(Collectors.toList());

        // Find candidate active OTP
        List<PickupOtp> allUnconsumed = pickupOtpRepository.findAll().stream()
                .filter(otp -> !otp.isConsumed())
                .collect(Collectors.toList());

        PickupOtp matchingOtp = null;
        for (PickupOtp candidate : allUnconsumed) {
            String candidateHash = hashOtp(rawOtp, candidate.getSalt());
            if (candidateHash.equals(candidate.getOtpHash())) {
                matchingOtp = candidate;
                break;
            }
        }

        if (matchingOtp == null) {
            throw new IllegalArgumentException("Invalid pickup OTP entered.");
        }

        // Check cross-shop authorization
        Order order = matchingOtp.getOrder();
        if (!ownerShopIds.contains(order.getShop().getId())) {
            throw new AccessDeniedException("You are not authorized to verify pickups for another shop.");
        }

        // Check lockout / brute-force threshold
        if (matchingOtp.getFailedAttempts() >= maxFailedAttempts) {
            throw new IllegalStateException("OTP has been locked due to excessive failed attempts. Customer must generate a new OTP.");
        }

        // Check expiration
        if (LocalDateTime.now().isAfter(matchingOtp.getExpiresAt())) {
            throw new IllegalStateException("Pickup OTP has expired. Please ask the customer to generate a new OTP.");
        }

        // Check consumed status
        if (matchingOtp.isConsumed() || order.getStatus() == OrderStatus.COLLECTED) {
            throw new IllegalStateException("Order has already been collected.");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is cancelled.");
        }

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new IllegalStateException("Order is not ready for pickup.");
        }

        // Mark verified (Note: DOES NOT mark order as COMPLETED! Shop Owner must manually complete)
        matchingOtp.setVerified(true);
        matchingOtp.setVerifiedAt(LocalDateTime.now());
        pickupOtpRepository.save(matchingOtp);

        // Build item responses
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::fromEntity)
                .collect(Collectors.toList());

        // Pickup Slot details
        PickupSlotResponse slotResponse = pickupSlotRepository.findByOrder(order)
                .map(PickupSlotResponse::fromEntity)
                .orElse(null);

        return ShopVerifiedPickupResponse.builder()
                .orderId(order.getId())
                .orderStatus(order.getStatus())
                .customer(ShopVerifiedPickupResponse.CustomerSummary.builder()
                        .id(order.getCustomer().getId())
                        .fullName(order.getCustomer().getFullName())
                        .phone(order.getCustomer().getPhone())
                        .email(order.getCustomer().getEmail())
                        .build())
                .shopName(order.getShop().getShopName())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .pickupSlot(slotResponse)
                .verifiedAt(matchingOtp.getVerifiedAt())
                .verified(true)
                .message("OTP verified successfully. Please review order details and confirm handover.")
                .build();
    }

    private String generateSalt() {
        byte[] bytes = new byte[16];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hashOtp(String otp, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private SecretKey getAesKey() {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, "AES");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available for AES key derivation", e);
        }
    }

    private String encryptOtp(String rawOtp) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, getAesKey(), spec);

            byte[] cipherText = cipher.doFinal(rawOtp.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt pickup OTP", e);
        }
    }

    private String decryptOtp(String encryptedData) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedData);
            if (combined.length < GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Invalid encrypted OTP payload");
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);

            byte[] cipherText = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, GCM_IV_LENGTH, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, getAesKey(), spec);

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt pickup OTP", e);
        }
    }

    private User getCustomerUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only CUSTOMER users can perform customer pickup operations");
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
