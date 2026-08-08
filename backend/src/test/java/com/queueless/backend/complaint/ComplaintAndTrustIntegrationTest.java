package com.queueless.backend.complaint;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.LoginRequest;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.dto.AddCartItemRequest;
import com.queueless.backend.cart.CartItemRepository;

import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductCategory;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.complaint.dto.AddEvidenceRequest;
import com.queueless.backend.complaint.dto.CreateComplaintRequest;
import com.queueless.backend.complaint.dto.ReviewComplaintRequest;
import com.queueless.backend.qr.PickupTokenRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.slot.PickupSlotRepository;
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
import java.time.LocalTime;
import java.util.Map;

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
class ComplaintAndTrustIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private com.queueless.backend.notification.NotificationRepository notificationRepository;

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
    private String adminToken;

    private User customer1;
    private User customer2;
    private User owner1;
    private User owner2;
    private User admin;

    private Shop shop1;
    private Shop shop2;
    private Product product1;

    private Order order1;
    private Order order2;

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

        // Owner 1
        shopOwner1Token = obtainToken(RegisterRequest.builder()
                .fullName("Owner One")
                .email("owner1@example.com")
                .phone("+33333333333")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        owner1 = userRepository.findByEmail("owner1@example.com").orElseThrow();

        // Owner 2
        shopOwner2Token = obtainToken(RegisterRequest.builder()
                .fullName("Owner Two")
                .email("owner2@example.com")
                .phone("+44444444444")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        owner2 = userRepository.findByEmail("owner2@example.com").orElseThrow();

        // Admin User created directly
        admin = userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@queueless.com")
                .phone("+99999999999")
                .password(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@queueless.com")
                .password("AdminPass123!")
                .build();

        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        Map<?, ?> adminRespMap = objectMapper.readValue(adminRes.getResponse().getContentAsString(), Map.class);
        adminToken = (String) adminRespMap.get("accessToken");

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

        // Order 1 (Customer 1, Shop 1)
        order1 = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.PENDING)
                .build());

        // Order 2 (Customer 2, Shop 2)
        order2 = orderRepository.save(Order.builder()
                .customer(customer2)
                .shop(shop2)
                .totalAmount(new BigDecimal("15.00"))
                .status(OrderStatus.PENDING)
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
    @DisplayName("1. Customer can complain about their own order")
    void customerCanComplainAboutOwnOrder() throws Exception {
        CreateComplaintRequest req = CreateComplaintRequest.builder()
                .type(ComplaintType.SHOP_DELAY)
                .description("Order was delayed by shop.")
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/complaints")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.complaintId", notNullValue()))
                .andExpect(jsonPath("$.orderId", is(order1.getId().toString())))
                .andExpect(jsonPath("$.complainantId", is(customer1.getId().toString())))
                .andExpect(jsonPath("$.reportedUserId", is(owner1.getId().toString())))
                .andExpect(jsonPath("$.reportedShopId", is(shop1.getId().toString())))
                .andExpect(jsonPath("$.status", is("SUBMITTED")));
    }

    @Test
    @DisplayName("2. Shop owner can complain about an order belonging to their shop")
    void shopOwnerCanComplainAboutOrderBelongingToTheirShop() throws Exception {
        CreateComplaintRequest req = CreateComplaintRequest.builder()
                .type(ComplaintType.CUSTOMER_NO_SHOW)
                .description("Customer failed to pick up order.")
                .build();

        mockMvc.perform(post("/api/shop/orders/" + order1.getId() + "/complaints")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.complainantId", is(owner1.getId().toString())))
                .andExpect(jsonPath("$.reportedUserId", is(customer1.getId().toString())))
                .andExpect(jsonPath("$.status", is("SUBMITTED")));
    }

    @Test
    @DisplayName("3. Customer cannot complain about another customer's order")
    void customerCannotComplainAboutAnotherCustomersOrder() throws Exception {
        CreateComplaintRequest req = CreateComplaintRequest.builder()
                .type(ComplaintType.SHOP_DELAY)
                .description("Order was delayed.")
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/complaints")
                        .header("Authorization", "Bearer " + customer2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Shop owner cannot complain about another shop's order")
    void shopOwnerCannotComplainAboutAnotherShopsOrder() throws Exception {
        CreateComplaintRequest req = CreateComplaintRequest.builder()
                .type(ComplaintType.CUSTOMER_ABUSE)
                .description("Abusive customer behavior.")
                .build();

        mockMvc.perform(post("/api/shop/orders/" + order1.getId() + "/complaints")
                        .header("Authorization", "Bearer " + shopOwner2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Unrelated users cannot create complaints")
    void unrelatedUsersCannotCreateComplaints() throws Exception {
        CreateComplaintRequest req = CreateComplaintRequest.builder()
                .type(ComplaintType.SHOP_DELAY)
                .description("Testing authorization.")
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/complaints")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. Complaint is initially SUBMITTED")
    void complaintIsInitiallySubmitted() throws Exception {
        CreateComplaintRequest req = CreateComplaintRequest.builder()
                .type(ComplaintType.SHOP_OTHER)
                .description("Issue description")
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/complaints")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));
    }

    @Test
    @DisplayName("7. Evidence can be added by complaint creator")
    void evidenceCanBeAddedByComplaintCreator() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .evidenceCount(0)
                .build());

        AddEvidenceRequest req = AddEvidenceRequest.builder()
                .type(EvidenceType.IMAGE)
                .fileUrl("https://storage.queueless.com/ev1.jpg")
                .description("Receipt screenshot")
                .build();

        mockMvc.perform(post("/api/complaints/" + complaint.getId() + "/evidence")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.evidenceId", notNullValue()))
                .andExpect(jsonPath("$.type", is("IMAGE")))
                .andExpect(jsonPath("$.fileUrl", is("https://storage.queueless.com/ev1.jpg")));
    }

    @Test
    @DisplayName("8. Evidence cannot be modified after review starts")
    void evidenceCannotBeModifiedAfterReviewStarts() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.UNDER_REVIEW)
                .evidenceCount(0)
                .build());

        AddEvidenceRequest req = AddEvidenceRequest.builder()
                .type(EvidenceType.IMAGE)
                .fileUrl("https://storage.queueless.com/ev2.jpg")
                .build();

        mockMvc.perform(post("/api/complaints/" + complaint.getId() + "/evidence")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("9. Admin can move complaint to UNDER_REVIEW")
    void adminCanMoveComplaintToUnderReview() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.UNDER_REVIEW)
                .reviewNote("Investigating issue")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UNDER_REVIEW")))
                .andExpect(jsonPath("$.reviewNote", is("Investigating issue")));
    }

    @Test
    @DisplayName("10. Admin can mark complaint VALID")
    void adminCanMarkComplaintValid() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Confirmed delay")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALID")));
    }

    @Test
    @DisplayName("11. Admin can mark complaint INVALID")
    void adminCanMarkComplaintInvalid() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.INVALID)
                .reviewNote("Unsubstantiated claim")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INVALID")));
    }

    @Test
    @DisplayName("12. Admin can dismiss complaint")
    void adminCanDismissComplaint() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.DISMISSED)
                .reviewNote("Duplicate complaint")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DISMISSED")));
    }

    @Test
    @DisplayName("13. Invalid complaint does not affect trust")
    void invalidComplaintDoesNotAffectTrust() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.INVALID)
                .reviewNote("Not valid")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk());

        User updatedOwner = userRepository.findById(owner1.getId()).orElseThrow();
        assertEquals(0, updatedOwner.getValidComplaintCount());
    }

    @Test
    @DisplayName("14. Valid complaint increases violation count")
    void validComplaintIncreasesViolationCount() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Valid claim")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk());

        User updatedOwner = userRepository.findById(owner1.getId()).orElseThrow();
        assertEquals(1, updatedOwner.getValidComplaintCount());

        Shop updatedShop = shopRepository.findById(shop1.getId()).orElseThrow();
        assertEquals(1, updatedShop.getValidComplaintCount());
    }

    @Test
    @DisplayName("15. Same valid complaint cannot increase count twice")
    void sameValidComplaintCannotIncreaseCountTwice() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.VALID)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Re-evaluating")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("16. Suspension threshold works")
    void suspensionThresholdWorks() throws Exception {
        owner1.setValidComplaintCount(2);
        userRepository.save(owner1);

        shop1.setValidComplaintCount(2);
        shopRepository.save(shop1);

        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Third valid complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Valid third offense")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk());

        User updatedOwner = userRepository.findById(owner1.getId()).orElseThrow();
        assertEquals(3, updatedOwner.getValidComplaintCount());
        assertEquals(AccountStatus.SUSPENDED, updatedOwner.getAccountStatus());

        Shop updatedShop = shopRepository.findById(shop1.getId()).orElseThrow();
        assertEquals(3, updatedShop.getValidComplaintCount());
        assertEquals(ShopStatus.SUSPENDED, updatedShop.getStatus());
    }

    @Test
    @DisplayName("17. Suspended user cannot login")
    void suspendedUserCannotLogin() throws Exception {
        customer1.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(customer1);

        LoginRequest loginReq = LoginRequest.builder()
                .email("alice@example.com")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("18. Suspended shop is hidden from customer discovery")
    void suspendedShopIsHiddenFromCustomerDiscovery() throws Exception {
        shop1.setStatus(ShopStatus.SUSPENDED);
        shopRepository.save(shop1);

        mockMvc.perform(get("/api/shops")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(shop2.getId().toString())));
    }



    @Test
    @DisplayName("19. Suspended shop cannot receive new orders")
    void suspendedShopCannotReceiveNewOrders() throws Exception {
        shop1.setStatus(ShopStatus.SUSPENDED);
        shopRepository.save(shop1);

        AddCartItemRequest req = AddCartItemRequest.builder()
                .productId(product1.getId())
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("20. Admin can reinstate user")
    void adminCanReinstateUser() throws Exception {
        customer1.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(customer1);

        mockMvc.perform(patch("/api/admin/users/" + customer1.getId() + "/reinstate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        User updatedCustomer = userRepository.findById(customer1.getId()).orElseThrow();
        assertEquals(AccountStatus.ACTIVE, updatedCustomer.getAccountStatus());
    }

    @Test
    @DisplayName("21. Admin can reinstate shop")
    void adminCanReinstateShop() throws Exception {
        shop1.setStatus(ShopStatus.SUSPENDED);
        shopRepository.save(shop1);

        mockMvc.perform(patch("/api/admin/shops/" + shop1.getId() + "/reinstate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        Shop updatedShop = shopRepository.findById(shop1.getId()).orElseThrow();
        assertEquals(ShopStatus.ACTIVE, updatedShop.getStatus());
    }

    @Test
    @DisplayName("22. Non-admin cannot review complaints")
    void nonAdminCannotReviewComplaints() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delay complaint")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest reviewReq = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("23. Non-admin cannot suspend users")
    void nonAdminCannotSuspendUsers() throws Exception {
        mockMvc.perform(patch("/api/admin/users/" + customer1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("24. Non-admin cannot suspend shops")
    void nonAdminCannotSuspendShops() throws Exception {
        mockMvc.perform(patch("/api/admin/shops/" + shop1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("25. Historical complaints remain after suspension")
    void historicalComplaintsRemainAfterSuspension() throws Exception {
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Historical complaint")
                .status(ComplaintStatus.VALID)
                .build());

        owner1.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(owner1);

        Complaint fetched = complaintRepository.findById(complaint.getId()).orElseThrow();
        assertNotNull(fetched);
        assertEquals(complaint.getId(), fetched.getId());
    }
}
