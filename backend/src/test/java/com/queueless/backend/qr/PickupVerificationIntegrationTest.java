package com.queueless.backend.qr;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.qr.dto.PickupVerificationRequest;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class PickupVerificationIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private PickupTokenRepository pickupTokenRepository;

    @Autowired
    private PickupSlotRepository pickupSlotRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private MockMvc mockMvc;

    private String customer1Token;
    private String customer2Token;
    private String shopOwner1Token;
    private String shopOwner2Token;

    private User customer1;
    private User customer2;
    private User owner1;
    private User owner2;

    private Shop shop1;
    private Shop shop2;

    private Order readyOrder1;
    private Order readyOrder2;
    private Order pendingOrder;
    private Order cancelledOrder;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        pickupTokenRepository.deleteAll();
        pickupSlotRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        shopRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // Register Users
        customer1Token = obtainToken(RegisterRequest.builder()
                .fullName("Alice Customer")
                .email("alice@example.com")
                .phone("+11111111111")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build());
        customer1 = userRepository.findByEmail("alice@example.com").orElseThrow();

        customer2Token = obtainToken(RegisterRequest.builder()
                .fullName("Bob Customer")
                .email("bob@example.com")
                .phone("+22222222222")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build());
        customer2 = userRepository.findByEmail("bob@example.com").orElseThrow();

        shopOwner1Token = obtainToken(RegisterRequest.builder()
                .fullName("Owner One")
                .email("owner1@example.com")
                .phone("+33333333333")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        owner1 = userRepository.findByEmail("owner1@example.com").orElseThrow();

        shopOwner2Token = obtainToken(RegisterRequest.builder()
                .fullName("Owner Two")
                .email("owner2@example.com")
                .phone("+44444444444")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        owner2 = userRepository.findByEmail("owner2@example.com").orElseThrow();

        // Shops
        shop1 = shopRepository.save(Shop.builder()
                .owner(owner1)
                .shopName("Owner One Supermarket")
                .category(ShopCategory.GROCERY)
                .phone("+12345678910")
                .address("100 Main St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        shop2 = shopRepository.save(Shop.builder()
                .owner(owner2)
                .shopName("Owner Two Bakery")
                .category(ShopCategory.BAKERY)
                .phone("+12345678911")
                .address("200 Bakery St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(7, 0))
                .closingTime(LocalTime.of(19, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        // Orders
        readyOrder1 = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("30.00"))
                .status(OrderStatus.READY_FOR_PICKUP)
                .build());

        readyOrder2 = orderRepository.save(Order.builder()
                .customer(customer2)
                .shop(shop2)
                .totalAmount(new BigDecimal("40.00"))
                .status(OrderStatus.READY_FOR_PICKUP)
                .build());

        pendingOrder = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("15.00"))
                .status(OrderStatus.PENDING)
                .build());

        cancelledOrder = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("20.00"))
                .status(OrderStatus.CANCELLED)
                .build());
    }

    private String obtainToken(RegisterRequest request) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) response.get("accessToken");
    }

    @Test
    @DisplayName("1. Customer can retrieve QR for their READY_FOR_PICKUP order")
    void customerCanRetrieveQrForReadyForPickupOrder() throws Exception {
        mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(readyOrder1.getId().toString())))
                .andExpect(jsonPath("$.pickupToken", notNullValue()))
                .andExpect(jsonPath("$.expiresAt", notNullValue()));
    }

    @Test
    @DisplayName("2. Customer cannot retrieve QR for another customer's order")
    void customerCannotRetrieveQrForAnotherCustomersOrder() throws Exception {
        mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. QR cannot be generated for a PENDING order")
    void qrCannotBeGeneratedForPendingOrder() throws Exception {
        mockMvc.perform(get("/api/orders/" + pendingOrder.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("4. QR cannot be generated for a CANCELLED order")
    void qrCannotBeGeneratedForCancelledOrder() throws Exception {
        mockMvc.perform(get("/api/orders/" + cancelledOrder.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("5. QR token is cryptographically random")
    void qrTokenIsCryptographicallyRandom() throws Exception {
        MvcResult res1 = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        MvcResult res2 = mockMvc.perform(get("/api/orders/" + readyOrder2.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr1 = objectMapper.readValue(res1.getResponse().getContentAsString(), Map.class);
        Map<?, ?> qr2 = objectMapper.readValue(res2.getResponse().getContentAsString(), Map.class);

        String token1 = (String) qr1.get("pickupToken");
        String token2 = (String) qr2.get("pickupToken");

        assertTrue(token1.startsWith("QLP:"));
        assertTrue(token2.startsWith("QLP:"));
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("6. Raw token is not stored in database")
    void rawTokenIsNotStoredInDatabase() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupToken tokenEntity = pickupTokenRepository.findByOrder(readyOrder1).orElseThrow();
        assertNotEquals(rawToken, tokenEntity.getTokenHash());
        assertTrue(tokenEntity.getTokenHash().length() == 64); // SHA-256 hex string length
    }

    @Test
    @DisplayName("7. Valid QR can be verified")
    void validQrCanBeVerified() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.status", is("COLLECTED")))
                .andExpect(jsonPath("$.shopName", is(shop1.getShopName())));
    }

    @Test
    @DisplayName("8. Wrong token is rejected")
    void wrongTokenIsRejected() throws Exception {
        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken("QLP:0000000000000000000000000000000000000000000000000000000000000000")
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("9. Expired token is rejected")
    void expiredTokenIsRejected() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        // Manually set expiration to past
        PickupToken tokenEntity = pickupTokenRepository.findByOrder(readyOrder1).orElseThrow();
        tokenEntity.setExpiresAt(LocalDateTime.now().minusMinutes(5));
        pickupTokenRepository.save(tokenEntity);

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("10. Already-used token is rejected")
    void alreadyUsedTokenIsRejected() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        // First verification succeeds
        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Second verification fails
        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("11. Customer cannot verify QR")
    void customerCannotVerifyQr() throws Exception {
        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken("QLP:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("12. Shop owner can verify orders belonging to their shop")
    void shopOwnerCanVerifyOrdersBelongingToTheirShop() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(readyOrder1.getId().toString())));
    }

    @Test
    @DisplayName("13. Shop owner cannot verify another shop's order")
    void shopOwnerCannotVerifyAnotherShopsOrder() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        // Shop Owner 2 attempts to verify Shop 1's order
        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("14. Order changes to COLLECTED after successful verification")
    void orderChangesToCollectedAfterSuccessfulVerification() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        Order updatedOrder = orderRepository.findById(readyOrder1.getId()).orElseThrow();
        assertEquals(OrderStatus.COLLECTED, updatedOrder.getStatus());
    }

    @Test
    @DisplayName("15. Token becomes used after successful verification")
    void tokenBecomesUsedAfterSuccessfulVerification() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        PickupToken tokenEntity = pickupTokenRepository.findByOrder(readyOrder1).orElseThrow();
        assertTrue(tokenEntity.isUsed());
        assertNotEquals(null, tokenEntity.getUsedAt());
    }

    @Test
    @DisplayName("16. Same QR cannot be used twice")
    void sameQrCannotBeUsedTwice() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("17. Concurrent verification allows only one successful collection")
    void concurrentVerificationAllowsOnlyOneSuccessfulCollection() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> qr = objectMapper.readValue(res.getResponse().getContentAsString(), Map.class);
        String rawToken = (String) qr.get("pickupToken");

        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken(rawToken)
                .build();

        int threads = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executorService.submit(() -> {
                try {
                    latch.await();
                    var mvcResult = mockMvc.perform(post("/api/shop/pickup/verify")
                                    .header("Authorization", "Bearer " + shopOwner1Token)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(req)))
                            .andReturn();

                    if (mvcResult.getResponse().getStatus() == 200) {
                        successCount.incrementAndGet();
                    } else {
                        failureCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            });
        }



        latch.countDown();
        executorService.shutdown();
        boolean finished = executorService.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS);
        assertTrue(finished, "Executor service did not finish in time");

        assertEquals(1, successCount.get());
        assertEquals(threads - 1, failureCount.get());
    }


    @Test
    @DisplayName("18. Collected order cannot be collected again")
    void collectedOrderCannotBeCollectedAgain() throws Exception {
        readyOrder1.setStatus(OrderStatus.COLLECTED);
        orderRepository.save(readyOrder1);

        mockMvc.perform(get("/api/orders/" + readyOrder1.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("19. Cancelled order cannot be collected")
    void cancelledOrderCannotBeCollected() throws Exception {
        mockMvc.perform(get("/api/orders/" + cancelledOrder.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("20. Nonexistent token returns proper error")
    void nonexistentTokenReturnsProperError() throws Exception {
        PickupVerificationRequest req = PickupVerificationRequest.builder()
                .pickupToken("QLP:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }
}
