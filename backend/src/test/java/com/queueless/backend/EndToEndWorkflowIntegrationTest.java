package com.queueless.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.LoginRequest;
import com.queueless.backend.auth.dto.RefreshTokenRequest;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.cart.dto.AddCartItemRequest;

import com.queueless.backend.complaint.ComplaintEvidenceRepository;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.complaint.ComplaintType;
import com.queueless.backend.complaint.dto.CreateComplaintRequest;
import com.queueless.backend.complaint.dto.ReviewComplaintRequest;
import com.queueless.backend.notification.NotificationRepository;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.product.ProductCategory;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.product.dto.CreateProductRequest;
import com.queueless.backend.qr.PickupTokenRepository;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.shop.dto.CreateShopRequest;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.dto.CreatePickupSlotRequest;
import com.queueless.backend.user.AccountStatus;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class EndToEndWorkflowIntegrationTest {

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
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
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
    }

    @Test
    @DisplayName("Complete QueueLess End-to-End Core Workflow Integration Test")
    void completeQueueLessWorkflow() throws Exception {
        // 0. Health check
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("QueueLess")));

        // 1. System Admin pre-creation
        userRepository.save(User.builder()
                .fullName("Platform Admin")
                .email("admin@queueless.com")
                .phone("+99999999999")
                .password(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // 2. Register Customer
        RegisterRequest custRegister = RegisterRequest.builder()
                .fullName("John Customer")
                .email("john@customer.com")
                .phone("+15550001111")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build();

        MvcResult custRegResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(custRegister)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andReturn();

        String customerToken = parseToken(custRegResult, "accessToken");
        String customerRefreshToken = parseToken(custRegResult, "refreshToken");

        // 3. Register Shop Owner
        RegisterRequest ownerRegister = RegisterRequest.builder()
                .fullName("Mary ShopOwner")
                .email("mary@owner.com")
                .phone("+15550002222")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build();

        MvcResult ownerRegResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerRegister)))
                .andExpect(status().isCreated())
                .andReturn();

        String ownerToken = parseToken(ownerRegResult, "accessToken");

        // 4. Refresh token test
        RefreshTokenRequest refreshReq = RefreshTokenRequest.builder()
                .refreshToken(customerRefreshToken)
                .build();

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()));

        // 5. Shop Owner creates shop
        CreateShopRequest createShop = CreateShopRequest.builder()
                .shopName("Fresh Mart")
                .description("Quality groceries")
                .category(ShopCategory.GROCERY)
                .phone("+15553334444")
                .address("456 Market St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .build();

        MvcResult shopResult = mockMvc.perform(post("/api/shops")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createShop)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn();

        UUID shopId = UUID.fromString(parseToken(shopResult, "id"));

        // Admin logs in and activates the shop
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@queueless.com")
                .password("AdminPass123!")
                .build();

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = parseToken(adminResult, "accessToken");

        mockMvc.perform(patch("/api/admin/shops/" + shopId + "/activate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        // 6. Shop Owner adds product
        CreateProductRequest createProd = CreateProductRequest.builder()
                .name("Organic Milk")
                .description("1 Gallon Whole Milk")
                .price(new BigDecimal("4.99"))
                .category(ProductCategory.DAIRY)
                .available(true)
                .stockQuantity(50)
                .build();

        MvcResult prodResult = mockMvc.perform(post("/api/shops/" + shopId + "/products")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createProd)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Organic Milk")))
                .andReturn();

        UUID productId = UUID.fromString(parseToken(prodResult, "id"));

        // 7. Customer browses shop & product
        mockMvc.perform(get("/api/shops/" + shopId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shopName", is("Fresh Mart")));

        mockMvc.perform(get("/api/shops/" + shopId + "/products")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // 8. Customer adds product to cart
        AddCartItemRequest addToCart = AddCartItemRequest.builder()
                .productId(productId)
                .quantity(2)
                .build();


        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addToCart)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.subtotal", is(9.98)));



        // 9. Customer checks out
        MvcResult checkoutResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.totalAmount", is(9.98)))
                .andReturn();



        UUID orderId = UUID.fromString(parseToken(checkoutResult, "id"));

        // 10. Shop Owner views & confirms order
        mockMvc.perform(get("/api/shop/orders")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/confirm")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")));

        // 11. Customer requests pickup slot
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        CreatePickupSlotRequest slotReq = CreatePickupSlotRequest.builder()
                .pickupDate(tomorrow)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build();

        MvcResult slotResult = mockMvc.perform(post("/api/orders/" + orderId + "/pickup-slot")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(slotReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("REQUESTED")))
                .andReturn();

        UUID slotId = UUID.fromString(parseToken(slotResult, "slotId"));

        // 12. Shop Owner accepts slot
        mockMvc.perform(patch("/api/pickup-slots/" + slotId + "/accept")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));

        // 13. Shop Owner starts preparing
        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/preparing")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PREPARING")));


        // 14. Shop Owner marks ready for pickup
        MvcResult readyRes = mockMvc.perform(patch("/api/shop/orders/" + orderId + "/ready")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("READY_FOR_PICKUP")))
                .andReturn();

        // 15. Customer retrieves pickup QR code
        MvcResult qrResult = mockMvc.perform(get("/api/orders/" + orderId + "/pickup-qr")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pickupToken", notNullValue()))
                .andExpect(jsonPath("$.orderId", is(orderId.toString())))
                .andReturn();

        String rawPickupToken = parseToken(qrResult, "pickupToken");



        // 16. Shop Owner scans QR code to verify pickup
        mockMvc.perform(post("/api/shop/pickup/verify")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("pickupToken", rawPickupToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COLLECTED")));

        // 17. Verify internal notifications
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));

        // 18. Customer files complaint against shop
        CreateComplaintRequest complaintReq = CreateComplaintRequest.builder()
                .type(ComplaintType.SHOP_WRONG_ORDER)
                .description("Product container was damaged")
                .build();

        MvcResult complaintResult = mockMvc.perform(post("/api/orders/" + orderId + "/complaints")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(complaintReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("SUBMITTED")))
                .andReturn();

        UUID complaintId = UUID.fromString(parseToken(complaintResult, "complaintId"));


        // 19. Admin reviews complaint as VALID
        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(com.queueless.backend.complaint.ComplaintStatus.VALID)
                .reviewNote("Confirmed with packaging proof")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaintId + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALID")));


        // 20. Admin verifies dashboard summary
        mockMvc.perform(get("/api/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders.collectedOrders", is(1)))
                .andExpect(jsonPath("$.complaints.validComplaints", is(1)));
    }

    private String parseToken(MvcResult result, String key) throws Exception {
        Map<?, ?> map = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return String.valueOf(map.get(key));
    }
}
