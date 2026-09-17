package com.queueless.backend.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.complaint.Complaint;
import com.queueless.backend.complaint.ComplaintEvidenceRepository;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.complaint.ComplaintType;
import com.queueless.backend.notification.NotificationRepository;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductCategory;
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
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AdminReportsIntegrationTest {

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

        // Register Admin
        adminUser = userRepository.save(User.builder()
                .email("admin@queueless.com")
                .password(passwordEncoder.encode("AdminPass123!"))
                .fullName("System Admin")
                .phone("+919999999999")
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // Register Customer
        customerUser = userRepository.save(User.builder()
                .email("customer@queueless.com")
                .password(passwordEncoder.encode("CustomerPass123!"))
                .fullName("Test Customer")
                .phone("+918888888888")
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // Register Shop Owner
        shopOwnerUser = userRepository.save(User.builder()
                .email("owner@queueless.com")
                .password(passwordEncoder.encode("OwnerPass123!"))
                .fullName("Test Shop Owner")
                .phone("+917777777777")
                .role(Role.SHOP_OWNER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // Create Shop
        shop1 = shopRepository.save(Shop.builder()
                .shopName("Express Grocery Mart")
                .description("Fast daily groceries")
                .category(ShopCategory.GROCERY)
                .status(ShopStatus.ACTIVE)
                .owner(shopOwnerUser)
                .address("123 Market St")
                .city("Chennai")
                .phone("+917777777777")
                .latitude(13.0827)
                .longitude(80.2707)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .validComplaintCount(0)
                .build());

        // Create Product
        Product product = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Organic Milk 1L")
                .description("Fresh cow milk")
                .category(ProductCategory.DAIRY)
                .price(BigDecimal.valueOf(65.00))
                .stockQuantity(100)
                .available(true)
                .build());

        // Create Orders
        Order order1 = orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(BigDecimal.valueOf(130.00))
                .status(OrderStatus.COLLECTED)
                .build());

        orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(BigDecimal.valueOf(65.00))
                .status(OrderStatus.PENDING)
                .build());

        orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(BigDecimal.valueOf(195.00))
                .status(OrderStatus.CANCELLED)
                .build());

        // Create Complaint
        complaintRepository.save(Complaint.builder()
                .complainant(customerUser)
                .reportedUser(shopOwnerUser)
                .reportedShop(shop1)
                .order(order1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Order preparation was delayed")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        // Obtain JWT tokens
        adminToken = loginAndGetToken("admin@queueless.com", "AdminPass123!");
        customerToken = loginAndGetToken("customer@queueless.com", "CustomerPass123!");
        shopOwnerToken = loginAndGetToken("owner@queueless.com", "OwnerPass123!");
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> responseMap = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) responseMap.get("accessToken");
    }

    @Test
    @DisplayName("Admin can fetch reports overview successfully")
    void testGetReportsOverview_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overview.totalUsers", is(3)))
                .andExpect(jsonPath("$.overview.totalCustomers", is(1)))
                .andExpect(jsonPath("$.overview.totalShopOwners", is(1)))
                .andExpect(jsonPath("$.overview.totalShops", is(1)))
                .andExpect(jsonPath("$.overview.activeShops", is(1)))
                .andExpect(jsonPath("$.overview.totalOrders", is(3)))
                .andExpect(jsonPath("$.overview.completedOrders", is(1)))
                .andExpect(jsonPath("$.overview.cancelledOrders", is(1)))
                .andExpect(jsonPath("$.overview.pendingOrders", is(1)))
                .andExpect(jsonPath("$.overview.totalOrderValue", is(390.0)))
                .andExpect(jsonPath("$.overview.collectedOrderValue", is(130.0)))
                .andExpect(jsonPath("$.overview.totalComplaints", is(1)))
                .andExpect(jsonPath("$.overview.pendingComplaints", is(1)))
                .andExpect(jsonPath("$.orderStatusDistribution", hasSize(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$.topShops", hasSize(1)))
                .andExpect(jsonPath("$.topShops[0].shopName", is("Express Grocery Mart")))
                .andExpect(jsonPath("$.topShops[0].totalOrders", is(3)))
                .andExpect(jsonPath("$.topShops[0].completedOrders", is(1)))
                .andExpect(jsonPath("$.topShops[0].cancelledOrders", is(1)))
                .andExpect(jsonPath("$.complaintsByStatus.SUBMITTED", is(1)))
                .andExpect(jsonPath("$.userRoleDistribution.CUSTOMER", is(1)))
                .andExpect(jsonPath("$.userRoleDistribution.SHOP_OWNER", is(1)))
                .andExpect(jsonPath("$.userRoleDistribution.ADMIN", is(1)));
    }

    @Test
    @DisplayName("Admin can fetch reports overview with date range filters")
    void testGetReportsOverview_WithDateFilter() throws Exception {
        LocalDate today = LocalDate.now();
        mockMvc.perform(get("/api/admin/reports/overview")
                        .param("from", today.minusDays(7).toString())
                        .param("to", today.toString())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overview.totalOrders", is(3)))
                .andExpect(jsonPath("$.ordersOverTime", hasSize(8)));
    }

    @Test
    @DisplayName("Non-admin roles are forbidden from accessing reports overview")
    void testGetReportsOverview_ForbiddenForNonAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/reports/overview")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/reports/overview")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/reports/overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Invalid date range returns 400 Bad Request")
    void testGetReportsOverview_InvalidDateRange() throws Exception {
        LocalDate today = LocalDate.now();
        mockMvc.perform(get("/api/admin/reports/overview")
                        .param("from", today.toString())
                        .param("to", today.minusDays(5).toString())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }
}
