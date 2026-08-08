package com.queueless.backend.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.LoginRequest;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.cart.dto.AddCartItemRequest;
import com.queueless.backend.complaint.ComplaintEvidenceRepository;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.notification.NotificationRepository;
import com.queueless.backend.order.dto.OrderResponse;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductCategory;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.qr.PickupTokenRepository;
import com.queueless.backend.qr.dto.PickupQrResponse;
import com.queueless.backend.qr.dto.PickupVerificationRequest;
import com.queueless.backend.shop.Shop;

import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.PickupSlotStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class OrderLifecycleIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ComplaintEvidenceRepository complaintEvidenceRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    private Product product1;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        notificationRepository.deleteAll();
        complaintEvidenceRepository.deleteAll();
        complaintRepository.deleteAll();
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

        // Customer 1
        customer1Token = obtainToken(RegisterRequest.builder()
                .fullName("Alice Customer")
                .email("alice@example.com")
                .phone("+11111111111")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build());
        customer1 = userRepository.findByEmail("alice@example.com").orElseThrow();

        // Customer 2
        customer2Token = obtainToken(RegisterRequest.builder()
                .fullName("Bob Customer")
                .email("bob@example.com")
                .phone("+22222222222")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build());
        customer2 = userRepository.findByEmail("bob@example.com").orElseThrow();

        // Shop Owner 1
        shopOwner1Token = obtainToken(RegisterRequest.builder()
                .fullName("Owner One")
                .email("owner1@example.com")
                .phone("+33333333333")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        owner1 = userRepository.findByEmail("owner1@example.com").orElseThrow();

        // Shop Owner 2
        shopOwner2Token = obtainToken(RegisterRequest.builder()
                .fullName("Owner Two")
                .email("owner2@example.com")
                .phone("+44444444444")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        owner2 = userRepository.findByEmail("owner2@example.com").orElseThrow();

        // Shop 1
        shop1 = shopRepository.save(Shop.builder()
                .owner(owner1)
                .shopName("Super Grocery")
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

        // Shop 2
        shop2 = shopRepository.save(Shop.builder()
                .owner(owner2)
                .shopName("Fresh Bakery")
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

        // Product 1
        product1 = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Organic Milk")
                .description("Fresh milk")
                .price(new BigDecimal("4.50"))
                .category(ProductCategory.DAIRY)
                .available(true)
                .stockQuantity(50)
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
    @DisplayName("1. PENDING -> CONFIRMED works")
    void pendingToConfirmedWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")));
    }

    @Test
    @DisplayName("2. PENDING -> REJECTED works")
    void pendingToRejectedWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/reject")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));
    }

    @Test
    @DisplayName("3. PENDING -> CANCELLED works")
    void pendingToCancelledWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("4. CONFIRMED -> PREPARING works")
    void confirmedToPreparingWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/preparing")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PREPARING")));
    }

    @Test
    @DisplayName("5. PREPARING -> READY_FOR_PICKUP works")
    void preparingToReadyForPickupWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PREPARING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/ready")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("READY_FOR_PICKUP")));
    }

    @Test
    @DisplayName("6. READY_FOR_PICKUP -> COLLECTED works through QR only")
    void readyForPickupToCollectedWorksThroughQrOnly() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.READY_FOR_PICKUP)
                .build());

        MvcResult qrResult = mockMvc.perform(get("/api/orders/" + order.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        PickupQrResponse qrResp = objectMapper.readValue(qrResult.getResponse().getContentAsString(), PickupQrResponse.class);

        PickupVerificationRequest verifyReq = PickupVerificationRequest.builder()
                .pickupToken(qrResp.getPickupToken())
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COLLECTED")));

    }

    @Test
    @DisplayName("7. Invalid state transitions fail")
    void invalidStateTransitionsFail() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        // PENDING -> PREPARING must fail
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/preparing")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());

        // PENDING -> READY must fail
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/ready")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("8. Customer cannot change shop order status")
    void customerCannotChangeShopOrderStatus() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9. Shop owner cannot modify another shop's order")
    void shopOwnerCannotModifyAnotherShopsOrder() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. Customer can cancel eligible order")
    void customerCanCancelEligibleOrder() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("11. Confirmed order cannot be cancelled")
    void confirmedOrderCannotBeCancelled() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("12. Rejected order cannot be prepared")
    void rejectedOrderCannotBePrepared() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.REJECTED)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/preparing")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("13. Cancelled order cannot be prepared")
    void cancelledOrderCannotBePrepared() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.CANCELLED)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/preparing")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("14. Collected order cannot be modified")
    void collectedOrderCannotBeModified() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.COLLECTED)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/ready")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("15. Ready transition validates pickup slot requirement")
    void readyTransitionValidatesPickupSlotRequirement() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PREPARING)
                .build());

        // Save an unconfirmed pickup slot (REQUESTED)
        pickupSlotRepository.save(PickupSlot.builder()
                .order(order)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(11, 0))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        // Transition to READY should fail because pickup slot is unconfirmed
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/ready")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("16. Notifications are created correctly across lifecycle")
    void notificationsAreCreatedCorrectlyAcrossLifecycle() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        // Confirm
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        // Preparing
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/preparing")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        // Check customer notifications count (CONFIRMED + PREPARING)
        long count = notificationRepository.countByRecipientAndReadFalse(customer1);
        assertEquals(2, count);
    }

    @Test
    @DisplayName("17. Shop order pagination works")
    void shopOrderPaginationWorks() throws Exception {
        for (int i = 0; i < 5; i++) {
            orderRepository.save(Order.builder()
                    .customer(customer1)
                    .shop(shop1)
                    .totalAmount(new BigDecimal("10.00"))
                    .status(OrderStatus.PENDING)
                    .build());
        }

        mockMvc.perform(get("/api/shop/orders?status=PENDING&page=0&size=2")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(5)))
                .andExpect(jsonPath("$.totalPages", is(3)));
    }

    @Test
    @DisplayName("18. Customer order pagination works")
    void customerOrderPaginationWorks() throws Exception {
        for (int i = 0; i < 3; i++) {
            orderRepository.save(Order.builder()
                    .customer(customer1)
                    .shop(shop1)
                    .totalAmount(new BigDecimal("10.00"))
                    .status(OrderStatus.PENDING)
                    .build());
        }

        mockMvc.perform(get("/api/orders?page=0&size=2")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(3)))
                .andExpect(jsonPath("$.totalPages", is(2)));
    }

    @Test
    @DisplayName("19. Order history remains available")
    void orderHistoryRemainsAvailable() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.COLLECTED)
                .build());

        mockMvc.perform(get("/api/orders/" + order.getId())
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(order.getId().toString())))
                .andExpect(jsonPath("$.status", is("COLLECTED")));
    }

    @Test
    @DisplayName("20. QR collection still works")
    void qrCollectionStillWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.READY_FOR_PICKUP)
                .build());

        MvcResult qrResult = mockMvc.perform(get("/api/orders/" + order.getId() + "/pickup-qr")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andReturn();

        PickupQrResponse qrResp = objectMapper.readValue(qrResult.getResponse().getContentAsString(), PickupQrResponse.class);

        PickupVerificationRequest verifyReq = PickupVerificationRequest.builder()
                .pickupToken(qrResp.getPickupToken())
                .build();

        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COLLECTED")));

    }

    @Test
    @DisplayName("21. Stock restoration is not duplicated")
    void stockRestorationIsNotDuplicated() throws Exception {
        int initialStock = product1.getStockQuantity();

        // Add item to cart
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(5)
                                .build())))
                .andExpect(status().isCreated());

        // Checkout
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        OrderResponse orderResp = objectMapper.readValue(orderRes.getResponse().getContentAsString(), OrderResponse.class);

        // Stock after checkout should be initialStock - 5
        Product pAfterCheckout = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(initialStock - 5, pAfterCheckout.getStockQuantity());

        // Cancel order
        mockMvc.perform(post("/api/orders/" + orderResp.getId() + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk());

        // Stock after cancel should be restored back to initialStock
        Product pAfterCancel = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(initialStock, pAfterCancel.getStockQuantity());

        // Second cancel attempt should fail and NOT restore stock again
        mockMvc.perform(post("/api/orders/" + orderResp.getId() + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());

        Product pAfterSecondCancel = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(initialStock, pAfterSecondCancel.getStockQuantity());
    }

    @Test
    @DisplayName("22. Transaction rollback works")
    void transactionRollbackWorks() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        // Attempting preparing from PENDING fails and leaves status as PENDING
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/preparing")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());

        Order fetched = orderRepository.findById(order.getId()).orElseThrow();
        assertEquals(OrderStatus.PENDING, fetched.getStatus());
    }
}
