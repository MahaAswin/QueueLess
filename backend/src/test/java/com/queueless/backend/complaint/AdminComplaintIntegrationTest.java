package com.queueless.backend.complaint;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.complaint.dto.ReviewComplaintRequest;
import com.queueless.backend.notification.NotificationRepository;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.ProductRepository;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AdminComplaintIntegrationTest {

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

    private String adminToken;
    private String customerToken;
    private String shopOwnerToken;

    private User adminUser;
    private User customerUser;
    private User shopOwnerUser;

    private Shop shop1;
    private Order order1;
    private Complaint complaint1;
    private Complaint complaint2;

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

        // Admin User
        adminUser = userRepository.save(User.builder()
                .fullName("System Admin")
                .email("admin@queueless.com")
                .phone("+99999999999")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .validComplaintCount(0)
                .build());

        // Customer User
        customerToken = obtainToken(RegisterRequest.builder()
                .fullName("Jane Doe")
                .email("jane@example.com")
                .phone("+11111111111")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build());
        customerUser = userRepository.findByEmail("jane@example.com").orElseThrow();

        // Shop Owner User
        shopOwnerToken = obtainToken(RegisterRequest.builder()
                .fullName("Bob Baker")
                .email("bob@example.com")
                .phone("+22222222222")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        shopOwnerUser = userRepository.findByEmail("bob@example.com").orElseThrow();

        // Admin Token via Login
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@queueless.com",
                                "password", "Password123!"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> loginResp = objectMapper.readValue(loginResult.getResponse().getContentAsString(), Map.class);
        adminToken = (String) loginResp.get("accessToken");

        // Shop
        shop1 = shopRepository.save(Shop.builder()
                .owner(shopOwnerUser)
                .shopName("Downtown Bakery")
                .category(ShopCategory.BAKERY)
                .phone("+1234567890")
                .address("101 Baker Street")
                .city("London")
                .latitude(51.5074)
                .longitude(-0.1278)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .status(ShopStatus.ACTIVE)
                .validComplaintCount(0)
                .build());

        // Order
        order1 = orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        // Complaint 1: Customer complaining against Shop
        complaint1 = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(customerUser)
                .reportedUser(shopOwnerUser)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Order was delayed by over 45 minutes beyond scheduled slot.")
                .status(ComplaintStatus.SUBMITTED)
                .evidenceCount(1)
                .build());

        complaintEvidenceRepository.save(ComplaintEvidence.builder()
                .complaint(complaint1)
                .type(EvidenceType.IMAGE)
                .fileUrl("https://storage.queueless.com/evidence/delay1.jpg")
                .description("Photo of counter receipt with timestamp")
                .build());

        // Complaint 2: Shop Owner complaining against Customer
        complaint2 = complaintRepository.save(Complaint.builder()
                .order(order1)
                .complainant(shopOwnerUser)
                .reportedUser(customerUser)
                .reportedShop(null)
                .type(ComplaintType.CUSTOMER_NO_SHOW)
                .description("Customer failed to arrive for pickup.")
                .status(ComplaintStatus.UNDER_REVIEW)
                .evidenceCount(0)
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
    @DisplayName("1. Admin can list all complaints with pagination")
    void adminCanListComplaints() throws Exception {
        mockMvc.perform(get("/api/admin/complaints")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(2)))
                .andExpect(jsonPath("$.totalPages", is(1)));
    }

    @Test
    @DisplayName("2. Admin can filter complaints by status")
    void adminCanFilterComplaintsByStatus() throws Exception {
        mockMvc.perform(get("/api/admin/complaints?status=SUBMITTED")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].complaintId", is(complaint1.getId().toString())));

        mockMvc.perform(get("/api/admin/complaints?status=UNDER_REVIEW")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].complaintId", is(complaint2.getId().toString())));

        mockMvc.perform(get("/api/admin/complaints?status=VALID")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("3. Admin can filter complaints by type")
    void adminCanFilterComplaintsByType() throws Exception {
        mockMvc.perform(get("/api/admin/complaints?type=SHOP_DELAY")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].type", is("SHOP_DELAY")));

        mockMvc.perform(get("/api/admin/complaints?type=CUSTOMER_NO_SHOW")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].type", is("CUSTOMER_NO_SHOW")));
    }

    @Test
    @DisplayName("4. Admin can search complaints by complainant, shop name, or description")
    void adminCanSearchComplaints() throws Exception {
        mockMvc.perform(get("/api/admin/complaints?search=Jane")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2))); // Jane is complainant in 1 and reported in 2

        mockMvc.perform(get("/api/admin/complaints?search=Downtown Bakery")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/admin/complaints?search=NonExistentKeyword")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("5. Admin can retrieve single complaint details with evidence items")
    void adminCanRetrieveComplaintDetails() throws Exception {
        mockMvc.perform(get("/api/admin/complaints/" + complaint1.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complaintId", is(complaint1.getId().toString())))
                .andExpect(jsonPath("$.complainantName", is("Jane Doe")))
                .andExpect(jsonPath("$.reportedUserName", is("Bob Baker")))
                .andExpect(jsonPath("$.reportedShopName", is("Downtown Bakery")))
                .andExpect(jsonPath("$.evidenceCount", is(1)))
                .andExpect(jsonPath("$.evidenceItems", hasSize(1)))
                .andExpect(jsonPath("$.evidenceItems[0].fileUrl", is("https://storage.queueless.com/evidence/delay1.jpg")));
    }

    @Test
    @DisplayName("6. Admin can review complaint and transition to VALID, incrementing trust violation")
    void adminCanReviewComplaintToValid() throws Exception {
        ReviewComplaintRequest request = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Delay confirmed via shop records and customer evidence. Trust penalty applied.")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint1.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALID")))
                .andExpect(jsonPath("$.reviewNote", is("Delay confirmed via shop records and customer evidence. Trust penalty applied.")))
                .andExpect(jsonPath("$.reviewedByAdminEmail", is("admin@queueless.com")));

        // Verify Trust violation increment
        User updatedOwner = userRepository.findById(shopOwnerUser.getId()).orElseThrow();
        assertEquals(1, updatedOwner.getValidComplaintCount());

        Shop updatedShop = shopRepository.findById(shop1.getId()).orElseThrow();
        assertEquals(1, updatedShop.getValidComplaintCount());
    }

    @Test
    @DisplayName("7. Admin can retrieve complaint summary metrics")
    void adminCanRetrieveComplaintSummary() throws Exception {
        mockMvc.perform(get("/api/admin/complaints/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalComplaints", is(2)))
                .andExpect(jsonPath("$.submittedComplaints", is(1)))
                .andExpect(jsonPath("$.underReviewComplaints", is(1)))
                .andExpect(jsonPath("$.validComplaints", is(0)));
    }

    @Test
    @DisplayName("8. Non-admin is denied access to admin complaint endpoints")
    void nonAdminIsForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/complaints")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/complaints")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/complaints/summary")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        ReviewComplaintRequest request = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Unauthorized review attempt")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint1.getId() + "/review")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
