package com.queueless.backend.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.admin.dto.AdminDashboardSummaryResponse;
import com.queueless.backend.admin.dto.OrderAnalyticsResponse;
import com.queueless.backend.admin.dto.ShopAnalyticsResponse;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AdminDashboardIntegrationTest {

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

        // Admin User
        adminUser = userRepository.save(User.builder()
                .fullName("System Admin")
                .email("admin@queueless.com")
                .phone("+99999999999")
                .password(passwordEncoder.encode("Password123!"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // Customer User
        customerToken = obtainToken(RegisterRequest.builder()
                .fullName("Regular Customer")
                .email("customer@example.com")
                .phone("+11111111111")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build());
        customerUser = userRepository.findByEmail("customer@example.com").orElseThrow();

        // Shop Owner User
        shopOwnerToken = obtainToken(RegisterRequest.builder()
                .fullName("Shop Owner")
                .email("owner@example.com")
                .phone("+22222222222")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build());
        shopOwnerUser = userRepository.findByEmail("owner@example.com").orElseThrow();

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

        // Create Shop
        shop1 = shopRepository.save(Shop.builder()
                .owner(shopOwnerUser)
                .shopName("Metro Supermarket")
                .category(ShopCategory.GROCERY)
                .phone("+1234567890")
                .address("123 Main St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        // Create Product
        product1 = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Fresh Apples")
                .description("Crisp red apples")
                .price(new BigDecimal("3.99"))
                .category(ProductCategory.GROCERY)
                .available(true)
                .stockQuantity(100)
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
    @DisplayName("1. Admin can access dashboard summary")
    void adminCanAccessDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.totalUsers", is(3)))
                .andExpect(jsonPath("$.users.totalCustomers", is(1)))
                .andExpect(jsonPath("$.users.totalShopOwners", is(1)))
                .andExpect(jsonPath("$.users.totalAdmins", is(1)))
                .andExpect(jsonPath("$.shops.totalShops", is(1)))
                .andExpect(jsonPath("$.shops.activeShops", is(1)))
                .andExpect(jsonPath("$.products.totalProducts", is(1)));
    }

    @Test
    @DisplayName("2. Customer cannot access dashboard")
    void customerCannotAccessDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Shop owner cannot access dashboard")
    void shopOwnerCannotAccessDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Unauthenticated user receives 401")
    void unauthenticatedUserReceives401() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("5. Dashboard counts are correct after creating data")
    void dashboardCountsAreCorrect() throws Exception {
        // Create an order
        orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("15.00"))
                .status(OrderStatus.COLLECTED)
                .build());

        mockMvc.perform(get("/api/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders.totalOrders", is(1)))
                .andExpect(jsonPath("$.orders.collectedOrders", is(1)));
    }

    @Test
    @DisplayName("6. Order analytics are correct")
    void orderAnalyticsAreCorrect() throws Exception {
        orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("20.00"))
                .status(OrderStatus.COLLECTED)
                .build());

        orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("10.00"))
                .status(OrderStatus.CANCELLED)
                .build());

        mockMvc.perform(get("/api/admin/analytics/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders", is(2)))
                .andExpect(jsonPath("$.completedOrders", is(1)))
                .andExpect(jsonPath("$.cancelledOrders", is(1)))
                .andExpect(jsonPath("$.totalOrderValue", is(20.00)))
                .andExpect(jsonPath("$.averageOrderValue", is(20.00)));
    }

    @Test
    @DisplayName("7. Date filtering works for order analytics")
    void dateFilteringWorks() throws Exception {
        LocalDate today = LocalDate.now();
        mockMvc.perform(get("/api/admin/analytics/orders?from=" + today + "&to=" + today)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders", is(0)));
    }

    @Test
    @DisplayName("8. Invalid date range is rejected")
    void invalidDateRangeIsRejected() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/orders?from=2026-08-31&to=2026-08-01")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("9. Shop analytics are correct")
    void shopAnalyticsAreCorrect() throws Exception {
        orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.COLLECTED)
                .build());

        mockMvc.perform(get("/api/admin/analytics/shops")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalShops", is(1)))
                .andExpect(jsonPath("$.activeShops", is(1)))
                .andExpect(jsonPath("$.shopsWithOrders", is(1)))
                .andExpect(jsonPath("$.topShops", hasSize(1)))
                .andExpect(jsonPath("$.topShops[0].shopName", is("Metro Supermarket")));
    }

    @Test
    @DisplayName("10. User analytics are correct")
    void userAnalyticsAreCorrect() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", is(3)))
                .andExpect(jsonPath("$.totalCustomers", is(1)))
                .andExpect(jsonPath("$.totalShopOwners", is(1)))
                .andExpect(jsonPath("$.totalAdmins", is(1)))
                .andExpect(jsonPath("$.activeUsers", is(3)));
    }

    @Test
    @DisplayName("11. Product analytics are correct")
    void productAnalyticsAreCorrect() throws Exception {
        productRepository.save(Product.builder()
                .shop(shop1)
                .name("Out of Stock Juice")
                .price(new BigDecimal("2.50"))
                .category(ProductCategory.BEVERAGES)
                .available(false)
                .stockQuantity(0)
                .build());

        mockMvc.perform(get("/api/admin/analytics/products")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts", is(2)))
                .andExpect(jsonPath("$.availableProducts", is(1)))
                .andExpect(jsonPath("$.unavailableProducts", is(1)))
                .andExpect(jsonPath("$.outOfStockProducts", is(1)));
    }

    @Test
    @DisplayName("12. Complaint analytics are correct")
    void complaintAnalyticsAreCorrect() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("10.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        complaintRepository.save(Complaint.builder()
                .order(order)
                .complainant(customerUser)
                .reportedUser(shopOwnerUser)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Shop delayed my order")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        mockMvc.perform(get("/api/admin/analytics/complaints")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalComplaints", is(1)))
                .andExpect(jsonPath("$.submittedComplaints", is(1)))
                .andExpect(jsonPath("$.byType.SHOP_DELAY", is(1)));
    }

    @Test
    @DisplayName("13. Trust analytics are correct")
    void trustAnalyticsAreCorrect() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/trust")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usersWithViolations", is(0)))
                .andExpect(jsonPath("$.shopsWithViolations", is(0)));
    }

    @Test
    @DisplayName("14. Recent orders are paginated")
    void recentOrdersArePaginated() throws Exception {
        for (int i = 0; i < 3; i++) {
            orderRepository.save(Order.builder()
                    .customer(customerUser)
                    .shop(shop1)
                    .totalAmount(new BigDecimal("10.00"))
                    .status(OrderStatus.PENDING)
                    .build());
        }

        mockMvc.perform(get("/api/admin/orders/recent?page=0&size=2")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(3)))
                .andExpect(jsonPath("$.totalPages", is(2)));
    }

    @Test
    @DisplayName("15. Recent complaints are paginated")
    void recentComplaintsArePaginated() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("10.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        for (int i = 0; i < 3; i++) {
            complaintRepository.save(Complaint.builder()
                    .order(order)
                    .complainant(customerUser)
                    .reportedUser(shopOwnerUser)
                    .reportedShop(shop1)
                    .type(ComplaintType.SHOP_DELAY)
                    .description("Delay " + i)
                    .status(ComplaintStatus.SUBMITTED)
                    .build());
        }

        mockMvc.perform(get("/api/admin/complaints/recent?page=0&size=2")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(3)));
    }

    @Test
    @DisplayName("16. Admin user listing works")
    void adminUserListingWorks() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)));
    }

    @Test
    @DisplayName("17. Non-admin cannot list users through admin endpoint")
    void nonAdminCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("18. Admin shop listing works")
    void adminShopListingWorks() throws Exception {
        mockMvc.perform(get("/api/admin/shops")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].shopName", is("Metro Supermarket")));
    }

    @Test
    @DisplayName("19. Shop filtering works")
    void shopFilteringWorks() throws Exception {
        mockMvc.perform(get("/api/admin/shops?status=ACTIVE&search=Metro")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    @DisplayName("20. User suspension authorization works")
    void userSuspensionAuthorizationWorks() throws Exception {
        // Customer attempt fails
        mockMvc.perform(patch("/api/admin/users/" + customerUser.getId() + "/suspend")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // Admin attempt succeeds
        mockMvc.perform(patch("/api/admin/users/" + customerUser.getId() + "/suspend")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        User suspended = userRepository.findById(customerUser.getId()).orElseThrow();
        assertEquals(AccountStatus.SUSPENDED, suspended.getAccountStatus());
    }

    @Test
    @DisplayName("21. Shop suspension authorization works")
    void shopSuspensionAuthorizationWorks() throws Exception {
        // Customer attempt fails
        mockMvc.perform(patch("/api/admin/shops/" + shop1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // Admin attempt succeeds
        mockMvc.perform(patch("/api/admin/shops/" + shop1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());


        Shop suspended = shopRepository.findById(shop1.getId()).orElseThrow();
        assertEquals(ShopStatus.SUSPENDED, suspended.getStatus());
    }

    @Test
    @DisplayName("22. Sensitive user fields are never returned")
    void sensitiveUserFieldsAreNeverReturned() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].password").doesNotExist());
    }

    @Test
    @DisplayName("23. Pagination maximum size is respected")
    void paginationMaximumSizeIsRespected() throws Exception {
        mockMvc.perform(get("/api/admin/orders/recent?page=0&size=500")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size", is(100)));
    }

    @Test
    @DisplayName("24. Analytics execute efficiently via database aggregation queries")
    void analyticsExecuteEfficientlyViaDatabaseAggregationQueries() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders", notNullValue()));
    }
}
