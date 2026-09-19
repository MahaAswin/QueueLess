package com.queueless.backend.otp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItem;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.otp.dto.ShopVerifyOtpRequest;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductCategory;
import com.queueless.backend.product.ProductRepository;
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

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class PickupOtpIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private com.queueless.backend.notification.NotificationRepository notificationRepository;

    @Autowired
    private com.queueless.backend.complaint.ComplaintEvidenceRepository complaintEvidenceRepository;

    @Autowired
    private com.queueless.backend.complaint.ComplaintRepository complaintRepository;

    @Autowired
    private PickupOtpRepository pickupOtpRepository;

    @Autowired
    private PickupSlotRepository pickupSlotRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private MockMvc mockMvc;

    private String customerToken;
    private String shopOwnerToken;
    private String otherShopOwnerToken;

    private User customerUser;
    private User shopOwnerUser;
    private User otherShopOwnerUser;

    private Shop shop;
    private Shop otherShop;
    private Product product;
    private Order readyOrder;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        notificationRepository.deleteAll();
        complaintEvidenceRepository.deleteAll();
        complaintRepository.deleteAll();
        pickupOtpRepository.deleteAll();
        pickupSlotRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        shopRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Register Customer
        customerToken = registerAndGetToken("customer@test.com", "Password123!", "Alice Customer", "+1111111111", Role.CUSTOMER);
        customerUser = userRepository.findByEmail("customer@test.com").orElseThrow();

        // 2. Register Shop Owner
        shopOwnerToken = registerAndGetToken("owner@test.com", "Password123!", "Bob Owner", "+2222222222", Role.SHOP_OWNER);
        shopOwnerUser = userRepository.findByEmail("owner@test.com").orElseThrow();

        // 3. Register Other Shop Owner
        otherShopOwnerToken = registerAndGetToken("otherowner@test.com", "Password123!", "Charlie Owner", "+3333333333", Role.SHOP_OWNER);
        otherShopOwnerUser = userRepository.findByEmail("otherowner@test.com").orElseThrow();

        // 4. Create Shop
        shop = Shop.builder()
                .owner(shopOwnerUser)
                .shopName("Bob's Bakery")
                .description("Fresh bread and pastries")
                .address("123 Baker St")
                .city("New York")
                .phone("+1234567890")
                .latitude(40.7128)
                .longitude(-74.0060)
                .category(ShopCategory.BAKERY)
                .status(ShopStatus.ACTIVE)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .build();
        shop = shopRepository.save(shop);

        // 5. Create Other Shop
        otherShop = Shop.builder()
                .owner(otherShopOwnerUser)
                .shopName("Charlie's Coffee")
                .description("Hot coffee")
                .address("456 Coffee Ave")
                .city("New York")
                .phone("+1987654321")
                .latitude(40.7138)
                .longitude(-74.0070)
                .category(ShopCategory.RESTAURANT)
                .status(ShopStatus.ACTIVE)
                .openingTime(LocalTime.of(7, 0))
                .closingTime(LocalTime.of(18, 0))
                .build();
        otherShop = shopRepository.save(otherShop);

        // 6. Create Product
        product = Product.builder()
                .shop(shop)
                .name("Sourdough Bread")
                .price(new BigDecimal("5.00"))
                .stockQuantity(100)
                .category(ProductCategory.BAKERY)
                .available(true)
                .build();
        product = productRepository.save(product);

        // 7. Create Ready Order
        readyOrder = Order.builder()
                .customer(customerUser)
                .shop(shop)
                .totalAmount(new BigDecimal("10.00"))
                .status(OrderStatus.READY_FOR_PICKUP)
                .build();
        readyOrder = orderRepository.save(readyOrder);

        OrderItem orderItem = OrderItem.builder()
                .order(readyOrder)
                .product(product)
                .productNameSnapshot(product.getName())
                .unitPriceSnapshot(product.getPrice())
                .quantity(2)
                .subtotal(new BigDecimal("10.00"))
                .build();
        orderItemRepository.save(orderItem);
    }

    private String registerAndGetToken(String email, String password, String fullName, String phone, Role role) throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(email)
                .password(password)
                .fullName(fullName)
                .phone(phone)
                .role(role)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> responseMap = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) responseMap.get("accessToken");
    }

    @Test
    @DisplayName("Customer can successfully generate 6-digit OTP for READY_FOR_PICKUP order")
    void customerCanGenerateOtp() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(readyOrder.getId().toString())))
                .andExpect(jsonPath("$.otp", notNullValue()))
                .andExpect(jsonPath("$.status", is("READY_FOR_PICKUP")))
                .andExpect(jsonPath("$.shopName", is("Bob's Bakery")))
                .andReturn();

        Map<?, ?> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String otp = (String) response.get("otp");
        assertEquals(6, otp.length());
        assertTrue(otp.matches("^[0-9]{6}$"));
    }

    @Test
    @DisplayName("Re-requesting active unexpired OTP returns the same OTP")
    void reRequestingOtpReturnsSameOtp() throws Exception {
        MvcResult res1 = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andReturn();
        String otp1 = (String) objectMapper.readValue(res1.getResponse().getContentAsString(), Map.class).get("otp");

        MvcResult res2 = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andReturn();
        String otp2 = (String) objectMapper.readValue(res2.getResponse().getContentAsString(), Map.class).get("otp");

        assertEquals(otp1, otp2);
    }

    @Test
    @DisplayName("Cannot generate OTP for PENDING, CONFIRMED, CANCELLED, or COLLECTED orders")
    void cannotGenerateOtpForIneligibleStatuses() throws Exception {
        readyOrder.setStatus(OrderStatus.PENDING);
        orderRepository.save(readyOrder);
        mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isBadRequest());

        readyOrder.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(readyOrder);
        mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isBadRequest());

        readyOrder.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(readyOrder);
        mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isBadRequest());

        readyOrder.setStatus(OrderStatus.COLLECTED);
        orderRepository.save(readyOrder);
        mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Shop owner can verify valid OTP and view order details WITHOUT automatically completing the order")
    void shopOwnerVerifyOtpTwoStepFlow() throws Exception {
        // Customer gets OTP
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andReturn();
        String otp = (String) objectMapper.readValue(res.getResponse().getContentAsString(), Map.class).get("otp");

        // Shop owner verifies OTP
        ShopVerifyOtpRequest verifyRequest = new ShopVerifyOtpRequest(otp);
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(readyOrder.getId().toString())))
                .andExpect(jsonPath("$.orderStatus", is("READY_FOR_PICKUP")))
                .andExpect(jsonPath("$.customer.fullName", is("Alice Customer")))
                .andExpect(jsonPath("$.customer.phone", is("+1111111111")))
                .andExpect(jsonPath("$.totalAmount", is(10.00)))
                .andExpect(jsonPath("$.verified", is(true)));

        // Verify order is STILL in READY_FOR_PICKUP status (not automatically completed)
        Order orderAfterVerify = orderRepository.findById(readyOrder.getId()).orElseThrow();
        assertEquals(OrderStatus.READY_FOR_PICKUP, orderAfterVerify.getStatus());

        // Now Shop Owner explicitly marks the order completed
        mockMvc.perform(patch("/api/shop/orders/" + readyOrder.getId() + "/complete")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COLLECTED")));

        Order completedOrder = orderRepository.findById(readyOrder.getId()).orElseThrow();
        assertEquals(OrderStatus.COLLECTED, completedOrder.getStatus());

        PickupOtp otpRecord = pickupOtpRepository.findByOrder(readyOrder).orElseThrow();
        assertTrue(otpRecord.isConsumed());
        assertNotNull(otpRecord.getConsumedAt());
    }

    @Test
    @DisplayName("Shop owner from another shop cannot verify OTP of a different shop's order")
    void unauthorizedShopOwnerCannotVerifyOtp() throws Exception {
        // Customer gets OTP for Bob's shop
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andReturn();
        String otp = (String) objectMapper.readValue(res.getResponse().getContentAsString(), Map.class).get("otp");

        // Charlie (Other Shop Owner) attempts to verify Bob's shop OTP
        ShopVerifyOtpRequest verifyRequest = new ShopVerifyOtpRequest(otp);
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + otherShopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Replay protection: cannot verify or complete already collected order")
    void replayProtectionTest() throws Exception {
        // Customer gets OTP
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andReturn();
        String otp = (String) objectMapper.readValue(res.getResponse().getContentAsString(), Map.class).get("otp");

        // Verify & complete
        ShopVerifyOtpRequest verifyRequest = new ShopVerifyOtpRequest(otp);
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/shop/orders/" + readyOrder.getId() + "/complete")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isOk());

        // Attempting to verify again with the same OTP fails
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Expired OTP cannot be verified")
    void expiredOtpCannotBeVerified() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/orders/" + readyOrder.getId() + "/pickup-otp")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andReturn();
        String otp = (String) objectMapper.readValue(res.getResponse().getContentAsString(), Map.class).get("otp");

        // Artificially expire the OTP in database
        PickupOtp otpRecord = pickupOtpRepository.findByOrder(readyOrder).orElseThrow();
        otpRecord.setExpiresAt(LocalDateTime.now().minusMinutes(5));
        pickupOtpRepository.save(otpRecord);

        ShopVerifyOtpRequest verifyRequest = new ShopVerifyOtpRequest(otp);
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Invalid or non-numeric OTP input is rejected")
    void invalidInputRejected() throws Exception {
        ShopVerifyOtpRequest invalidFormatRequest = new ShopVerifyOtpRequest("ABC123");
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidFormatRequest)))
                .andExpect(status().isBadRequest());

        ShopVerifyOtpRequest shortRequest = new ShopVerifyOtpRequest("123");
        mockMvc.perform(post("/api/shop/pickup/verify-otp")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortRequest)))
                .andExpect(status().isBadRequest());
    }
}
