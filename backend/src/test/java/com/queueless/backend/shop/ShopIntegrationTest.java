package com.queueless.backend.shop;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.LoginRequest;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.shop.dto.CreateShopRequest;
import com.queueless.backend.shop.dto.UpdateShopRequest;
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

import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class ShopIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.queueless.backend.qr.PickupTokenRepository pickupTokenRepository;

    @Autowired
    private com.queueless.backend.slot.PickupSlotRepository pickupSlotRepository;

    @Autowired
    private com.queueless.backend.order.OrderItemRepository orderItemRepository;

    @Autowired
    private com.queueless.backend.order.OrderRepository orderRepository;

    @Autowired
    private com.queueless.backend.cart.CartItemRepository cartItemRepository;

    @Autowired
    private com.queueless.backend.cart.CartRepository cartRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private MockMvc mockMvc;

    private String shopOwnerToken;
    private String customerToken;
    private String secondOwnerToken;

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
        shopRepository.deleteAll();

        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();


        // Register & authenticate SHOP_OWNER 1
        RegisterRequest ownerReq = RegisterRequest.builder()
                .fullName("Owner One")
                .email("owner1@example.com")
                .phone("+12345678901")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build();
        shopOwnerToken = obtainToken(ownerReq);

        // Register & authenticate SHOP_OWNER 2
        RegisterRequest owner2Req = RegisterRequest.builder()
                .fullName("Owner Two")
                .email("owner2@example.com")
                .phone("+12345678902")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build();
        secondOwnerToken = obtainToken(owner2Req);

        // Register & authenticate CUSTOMER
        RegisterRequest customerReq = RegisterRequest.builder()
                .fullName("Customer One")
                .email("customer1@example.com")
                .phone("+12345678903")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build();
        customerToken = obtainToken(customerReq);
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
    @DisplayName("1. Shop owner can create shop")
    void shopOwnerCanCreateShop() throws Exception {
        CreateShopRequest request = CreateShopRequest.builder()
                .shopName("Fresh Grocery Store")
                .description("Quality groceries and veggies")
                .category(ShopCategory.GROCERY)
                .phone("+12345678910")
                .address("123 Main Street")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .build();

        mockMvc.perform(post("/api/shops")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.shopName", is("Fresh Grocery Store")))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    @Test
    @DisplayName("2. Customer cannot create shop")
    void customerCannotCreateShop() throws Exception {
        CreateShopRequest request = CreateShopRequest.builder()
                .shopName("Customer Attempt Shop")
                .category(ShopCategory.OTHER)
                .phone("+12345678911")
                .address("456 Customer Road")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(9, 0))
                .closingTime(LocalTime.of(17, 0))
                .build();

        mockMvc.perform(post("/api/shops")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Unauthenticated user cannot create shop")
    void unauthenticatedUserCannotCreateShop() throws Exception {
        CreateShopRequest request = CreateShopRequest.builder()
                .shopName("No Auth Shop")
                .category(ShopCategory.GROCERY)
                .phone("+12345678912")
                .address("789 Anon Street")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(18, 0))
                .build();

        mockMvc.perform(post("/api/shops")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. Shop is created with PENDING status")
    void shopIsCreatedWithPendingStatus() throws Exception {
        CreateShopRequest request = CreateShopRequest.builder()
                .shopName("Pending Bakery")
                .category(ShopCategory.BAKERY)
                .phone("+12345678913")
                .address("10 Bakery Ave")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(7, 0))
                .closingTime(LocalTime.of(19, 0))
                .build();

        mockMvc.perform(post("/api/shops")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    @Test
    @DisplayName("5. Owner can view their shop")
    void ownerCanViewTheirShop() throws Exception {
        CreateShopRequest request = CreateShopRequest.builder()
                .shopName("My Own Shop")
                .category(ShopCategory.PHARMACY)
                .phone("+12345678914")
                .address("12 Health St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .build();

        mockMvc.perform(post("/api/shops")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/shops/my")
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].shopName", is("My Own Shop")));
    }

    @Test
    @DisplayName("6. Owner can update their shop")
    void ownerCanUpdateTheirShop() throws Exception {
        User owner = userRepository.findByEmail("owner1@example.com").orElseThrow();
        Shop shop = shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Old Shop Name")
                .category(ShopCategory.GROCERY)
                .phone("+12345678915")
                .address("Old Address")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        UpdateShopRequest updateRequest = UpdateShopRequest.builder()
                .shopName("New Shop Name")
                .address("Updated Address")
                .build();

        mockMvc.perform(put("/api/shops/" + shop.getId())
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shopName", is("New Shop Name")))
                .andExpect(jsonPath("$.address", is("Updated Address")));
    }

    @Test
    @DisplayName("7. Owner cannot update another owner's shop")
    void ownerCannotUpdateAnotherOwnersShop() throws Exception {
        User owner1 = userRepository.findByEmail("owner1@example.com").orElseThrow();
        Shop shop = shopRepository.save(Shop.builder()
                .owner(owner1)
                .shopName("Owner One Shop")
                .category(ShopCategory.RESTAURANT)
                .phone("+12345678916")
                .address("Food Street")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(10, 0))
                .closingTime(LocalTime.of(23, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        UpdateShopRequest updateRequest = UpdateShopRequest.builder()
                .shopName("Hacked Shop Name")
                .build();

        mockMvc.perform(put("/api/shops/" + shop.getId())
                        .header("Authorization", "Bearer " + secondOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Customer can view active shops")
    void customerCanViewActiveShops() throws Exception {
        User owner = userRepository.findByEmail("owner1@example.com").orElseThrow();

        // Active shop
        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Active Grocery")
                .category(ShopCategory.GROCERY)
                .phone("+12345678917")
                .address("1 Market St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        // Pending shop
        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Pending Store")
                .category(ShopCategory.OTHER)
                .phone("+12345678918")
                .address("2 Market St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .status(ShopStatus.PENDING)
                .build());

        mockMvc.perform(get("/api/shops")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].shopName", is("Active Grocery")));
    }

    @Test
    @DisplayName("9. Suspended shops are excluded from normal discovery")
    void suspendedShopsAreExcludedFromNormalDiscovery() throws Exception {
        User owner = userRepository.findByEmail("owner1@example.com").orElseThrow();

        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Suspended Pharmacy")
                .category(ShopCategory.PHARMACY)
                .phone("+12345678919")
                .address("99 Suspended Rd")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .status(ShopStatus.SUSPENDED)
                .build());

        mockMvc.perform(get("/api/shops")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("10. Search by shop name works")
    void searchByShopNameWorks() throws Exception {
        User owner = userRepository.findByEmail("owner1@example.com").orElseThrow();

        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Alpha Bakery")
                .category(ShopCategory.BAKERY)
                .phone("+12345678920")
                .address("1 Alpha St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(7, 0))
                .closingTime(LocalTime.of(19, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Beta Restaurant")
                .category(ShopCategory.RESTAURANT)
                .phone("+12345678921")
                .address("2 Beta St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(11, 0))
                .closingTime(LocalTime.of(22, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        mockMvc.perform(get("/api/shops/search?name=alpha")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].shopName", is("Alpha Bakery")));
    }

    @Test
    @DisplayName("11. Filter by category works")
    void filterByCategoryWorks() throws Exception {
        User owner = userRepository.findByEmail("owner1@example.com").orElseThrow();

        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Meat Shop Express")
                .category(ShopCategory.MEAT_SHOP)
                .phone("+12345678922")
                .address("Meat Street")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(6, 0))
                .closingTime(LocalTime.of(16, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        shopRepository.save(Shop.builder()
                .owner(owner)
                .shopName("Stationery Hub")
                .category(ShopCategory.STATIONERY)
                .phone("+12345678923")
                .address("School Road")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(9, 0))
                .closingTime(LocalTime.of(18, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        mockMvc.perform(get("/api/shops/category/MEAT_SHOP")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].shopName", is("Meat Shop Express")));
    }

    @Test
    @DisplayName("12. Invalid shop data is rejected")
    void invalidShopDataIsRejected() throws Exception {
        // Closing time before opening time
        CreateShopRequest invalidTimeRequest = CreateShopRequest.builder()
                .shopName("Invalid Hours Shop")
                .category(ShopCategory.GROCERY)
                .phone("+12345678924")
                .address("Clock St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(20, 0))
                .closingTime(LocalTime.of(8, 0))
                .build();

        mockMvc.perform(post("/api/shops")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidTimeRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("13. Nonexistent shop returns appropriate error")
    void nonexistentShopReturnsAppropriateError() throws Exception {
        UUID fakeId = UUID.randomUUID();

        mockMvc.perform(get("/api/shops/" + fakeId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("14. Authorization rules work correctly")
    void authorizationRulesWorkCorrectly() throws Exception {
        // Unauthenticated search access attempt fails
        mockMvc.perform(get("/api/shops/search?name=test"))
                .andExpect(status().isUnauthorized());
    }
}
