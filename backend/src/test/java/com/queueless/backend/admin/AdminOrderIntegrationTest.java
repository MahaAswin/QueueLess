package com.queueless.backend.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.complaint.ComplaintEvidenceRepository;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.notification.NotificationRepository;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItem;
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
import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.PickupSlotStatus;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AdminOrderIntegrationTest {

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
    private Shop shop2;
    private Product product1;
    private Order order1;

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

        // Create Shops
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
                .build());

        shop2 = shopRepository.save(Shop.builder()
                .owner(shopOwnerUser)
                .shopName("Uptown Cafe")
                .category(ShopCategory.RESTAURANT)
                .phone("+1234567899")
                .address("202 High Street")
                .city("London")
                .latitude(51.5074)
                .longitude(-0.1278)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        // Create Product
        product1 = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Sourdough Bread")
                .price(new BigDecimal("5.50"))
                .category(ProductCategory.BAKERY)
                .available(true)
                .stockQuantity(50)
                .build());

        // Create Order 1
        order1 = Order.builder()
                .customer(customerUser)
                .shop(shop1)
                .totalAmount(new BigDecimal("11.00"))
                .status(OrderStatus.CONFIRMED)
                .items(new ArrayList<>())
                .build();

        OrderItem item1 = OrderItem.builder()
                .order(order1)
                .product(product1)
                .productNameSnapshot("Sourdough Bread")
                .unitPriceSnapshot(new BigDecimal("5.50"))
                .quantity(2)
                .subtotal(new BigDecimal("11.00"))
                .build();
        order1.getItems().add(item1);
        order1 = orderRepository.save(order1);

        // Pickup Slot for Order 1
        pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now())
                .requestedStartTime(LocalTime.of(14, 0))
                .requestedEndTime(LocalTime.of(14, 30))
                .status(PickupSlotStatus.CUSTOMER_ACCEPTED)
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
    @DisplayName("1. Admin can list all orders across all shops")
    void adminCanListOrders() throws Exception {
        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].customerName", is("Jane Doe")))
                .andExpect(jsonPath("$.content[0].shopName", is("Downtown Bakery")))
                .andExpect(jsonPath("$.content[0].status", is("CONFIRMED")))
                .andExpect(jsonPath("$.totalElements", is(1)));
    }

    @Test
    @DisplayName("2. Admin can filter orders by status")
    void adminCanFilterOrdersByStatus() throws Exception {
        mockMvc.perform(get("/api/admin/orders?status=CONFIRMED")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/admin/orders?status=PENDING")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("3. Admin can filter orders by shop")
    void adminCanFilterOrdersByShop() throws Exception {
        mockMvc.perform(get("/api/admin/orders?shopId=" + shop1.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/admin/orders?shopId=" + shop2.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("4. Admin can search orders by customer or shop name")
    void adminCanSearchOrders() throws Exception {
        mockMvc.perform(get("/api/admin/orders?search=Bakery")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/admin/orders?search=NonExistent")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("5. Admin can retrieve full order details")
    void adminCanRetrieveOrderDetails() throws Exception {
        mockMvc.perform(get("/api/admin/orders/" + order1.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(order1.getId().toString())))
                .andExpect(jsonPath("$.customerName", is("Jane Doe")))
                .andExpect(jsonPath("$.customerEmail", is("jane@example.com")))
                .andExpect(jsonPath("$.shopName", is("Downtown Bakery")))
                .andExpect(jsonPath("$.ownerName", is("Bob Baker")))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productName", is("Sourdough Bread")))
                .andExpect(jsonPath("$.items[0].quantity", is(2)))
                .andExpect(jsonPath("$.pickupSlot", notNullValue()));
    }

    @Test
    @DisplayName("6. Admin can retrieve order summary metrics")
    void adminCanRetrieveOrderSummary() throws Exception {
        mockMvc.perform(get("/api/admin/orders/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders", is(1)))
                .andExpect(jsonPath("$.confirmedOrders", is(1)))
                .andExpect(jsonPath("$.totalRevenue", is(11.00)));
    }

    @Test
    @DisplayName("7. Non-admin is denied access to admin order endpoints")
    void nonAdminIsForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/orders/" + order1.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }
}
