package com.queueless.backend.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.dto.AddCartItemRequest;
import com.queueless.backend.cart.dto.UpdateCartItemRequest;
import com.queueless.backend.order.Order;
import com.queueless.backend.order.OrderItemRepository;
import com.queueless.backend.order.OrderRepository;
import com.queueless.backend.order.OrderStatus;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductCategory;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
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
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class CartAndOrderIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private com.queueless.backend.notification.NotificationRepository notificationRepository;

    @Autowired
    private com.queueless.backend.complaint.ComplaintEvidenceRepository complaintEvidenceRepository;

    @Autowired
    private com.queueless.backend.complaint.ComplaintRepository complaintRepository;


    @Autowired
    private com.queueless.backend.qr.PickupTokenRepository pickupTokenRepository;

    @Autowired
    private com.queueless.backend.slot.PickupSlotRepository pickupSlotRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

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
    private Product product1;
    private Product product2;
    private Product shop2Product;

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

        // Shop 1 (Owner 1)
        shop1 = shopRepository.save(Shop.builder()
                .owner(owner1)
                .shopName("Super Grocery Store")
                .category(ShopCategory.GROCERY)
                .phone("+12345678910")
                .address("100 Main St")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(22, 0))
                .status(ShopStatus.ACTIVE)
                .build());

        // Shop 2 (Owner 2)
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

        // Products for Shop 1
        product1 = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Fresh Apples")
                .description("Crispy red apples")
                .price(new BigDecimal("3.00"))
                .stockQuantity(10)
                .category(ProductCategory.FRUITS_VEGETABLES)
                .available(true)
                .build());

        product2 = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Organic Milk")
                .description("Whole milk 1L")
                .price(new BigDecimal("2.50"))
                .stockQuantity(20)
                .category(ProductCategory.DAIRY)
                .available(true)
                .build());

        // Product for Shop 2
        shop2Product = productRepository.save(Product.builder()
                .shop(shop2)
                .name("French Croissant")
                .description("Butter croissant")
                .price(new BigDecimal("4.00"))
                .stockQuantity(15)
                .category(ProductCategory.BAKERY)
                .available(true)
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

    // ==========================================
    // CART TESTS
    // ==========================================

    @Test
    @DisplayName("1. Customer can add product to cart")
    void customerCanAddProductToCart() throws Exception {
        AddCartItemRequest req = AddCartItemRequest.builder()
                .productId(product1.getId())
                .quantity(2)
                .build();

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cartId", notNullValue()))
                .andExpect(jsonPath("$.shopId", is(shop1.getId().toString())))
                .andExpect(jsonPath("$.shopName", is("Super Grocery Store")))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].productName", is("Fresh Apples")))
                .andExpect(jsonPath("$.items[0].quantity", is(2)))
                .andExpect(jsonPath("$.subtotal", is(6.00)));
    }

    @Test
    @DisplayName("2. Customer can update quantity in cart")
    void customerCanUpdateQuantityInCart() throws Exception {
        AddCartItemRequest addReq = AddCartItemRequest.builder()
                .productId(product1.getId())
                .quantity(2)
                .build();

        MvcResult result = mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> cartResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        Map<?, ?> item = (Map<?, ?>) ((java.util.List<?>) cartResp.get("items")).get(0);
        String itemId = (String) item.get("itemId");

        UpdateCartItemRequest updateReq = UpdateCartItemRequest.builder()
                .quantity(5)
                .build();

        mockMvc.perform(put("/api/cart/items/" + itemId)
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity", is(5)))
                .andExpect(jsonPath("$.subtotal", is(15.00)));
    }

    @Test
    @DisplayName("3. Customer can remove item from cart")
    void customerCanRemoveItemFromCart() throws Exception {
        AddCartItemRequest addReq = AddCartItemRequest.builder()
                .productId(product1.getId())
                .quantity(2)
                .build();

        MvcResult result = mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> cartResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        Map<?, ?> item = (Map<?, ?>) ((java.util.List<?>) cartResp.get("items")).get(0);
        String itemId = (String) item.get("itemId");

        mockMvc.perform(delete("/api/cart/items/" + itemId)
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.subtotal", is(0)));
    }

    @Test
    @DisplayName("4. Customer can clear cart")
    void customerCanClearCart() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/cart")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.subtotal", is(0)));
    }

    @Test
    @DisplayName("5. Customer cannot access another customer's cart")
    void customerCannotAccessAnotherCustomersCart() throws Exception {
        // Customer 1 adds item
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        // Customer 2 views own cart (which is empty)
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)));
    }

    @Test
    @DisplayName("6. Cannot add unavailable product to cart")
    void cannotAddUnavailableProductToCart() throws Exception {
        Product unavailable = productRepository.save(Product.builder()
                .shop(shop1)
                .name("Discontinued Soda")
                .price(new BigDecimal("1.50"))
                .stockQuantity(10)
                .category(ProductCategory.BEVERAGES)
                .available(false)
                .build());

        AddCartItemRequest req = AddCartItemRequest.builder()
                .productId(unavailable.getId())
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("7. Cannot add more than available stock")
    void cannotAddMoreThanAvailableStock() throws Exception {
        AddCartItemRequest req = AddCartItemRequest.builder()
                .productId(product1.getId()) // stock is 10
                .quantity(15)
                .build();

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("8. Cannot add products from multiple shops")
    void cannotAddProductsFromMultipleShops() throws Exception {
        // Add item from Shop 1
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(1)
                                .build())))
                .andExpect(status().isCreated());

        // Attempt to add item from Shop 2
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(shop2Product.getId())
                                .quantity(1)
                                .build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("9. Cart total is calculated correctly")
    void cartTotalIsCalculatedCorrectly() throws Exception {
        // Add 2 Apples ($3.00 each)
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        // Add 4 Milk ($2.50 each)
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product2.getId())
                                .quantity(4)
                                .build())))
                .andExpect(status().isCreated());

        // Total = 2*3.00 + 4*2.50 = 6.00 + 10.00 = 16.00
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.subtotal", is(16.00)))
                .andExpect(jsonPath("$.totalItemCount", is(6)));
    }

    // ==========================================
    // ORDER TESTS
    // ==========================================

    @Test
    @DisplayName("10. Customer can checkout")
    void customerCanCheckout() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(3)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.shopId", is(shop1.getId().toString())))
                .andExpect(jsonPath("$.totalAmount", is(9.00)))
                .andExpect(jsonPath("$.items", hasSize(1)));
    }

    @Test
    @DisplayName("11. Empty cart cannot checkout")
    void emptyCartCannotCheckout() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("12. Correct order total is calculated server-side")
    void correctOrderTotalIsCalculatedServerSide() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId()) // $3.00 x 2
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product2.getId()) // $2.50 x 3
                                .quantity(3)
                                .build())))
                .andExpect(status().isCreated());

        // Total = 6.00 + 7.50 = 13.50
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAmount", is(13.50)));
    }

    @Test
    @DisplayName("13. Product price is snapshotted in order")
    void productPriceIsSnapshotted() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId()) // current price $3.00
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        // Now change product price in DB
        product1.setPrice(new BigDecimal("10.00"));
        productRepository.save(product1);

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        // Order total and snapshot unit price must remain unaffected
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount", is(6.00)))
                .andExpect(jsonPath("$.items[0].unitPrice", is(3.00)));
    }

    @Test
    @DisplayName("14. Stock decreases after successful order")
    void stockDecreasesAfterSuccessfulOrder() throws Exception {
        int initialStock = product1.getStockQuantity(); // 10

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(4)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated());

        Product updatedProduct = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(initialStock - 4, updatedProduct.getStockQuantity());
    }

    @Test
    @DisplayName("15. Stock cannot become negative")
    void stockCannotBecomeNegative() throws Exception {
        // Set stock to 2
        product1.setStockQuantity(2);
        productRepository.save(product1);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        // Meanwhile another customer buys the 2 items directly in DB
        product1.setStockQuantity(0);
        product1.setAvailable(false);
        productRepository.save(product1);

        // Customer 1 checkout attempt fails
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());

        Product recheckedProduct = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(0, recheckedProduct.getStockQuantity());
    }

    @Test
    @DisplayName("16. Cart is cleared after successful order")
    void cartIsClearedAfterSuccessfulOrder() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)));
    }

    @Test
    @DisplayName("17. Customer can view own orders")
    void customerCanViewOwnOrders() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(1)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("18. Customer cannot view another customer's order")
    void customerCannotViewAnotherCustomersOrder() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(1)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("19. Shop owner can view their shop's orders")
    void shopOwnerCanViewTheirShopsOrders() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/shop/orders")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].shopId", is(shop1.getId().toString())));
    }

    @Test
    @DisplayName("20. Shop owner cannot view another shop's orders")
    void shopOwnerCannotViewAnotherShopsOrders() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(get("/api/shop/orders/" + orderId)
                        .header("Authorization", "Bearer " + shopOwner2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("21. Shop owner can confirm pending order")
    void shopOwnerCanConfirmPendingOrder() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")));
    }

    @Test
    @DisplayName("22. Shop owner can reject pending order")
    void shopOwnerCanRejectPendingOrder() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/reject")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));
    }

    @Test
    @DisplayName("23. Rejected order restores stock")
    void rejectedOrderRestoresStock() throws Exception {
        int initialStock = product1.getStockQuantity(); // 10

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(3)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        assertEquals(initialStock - 3, productRepository.findById(product1.getId()).orElseThrow().getStockQuantity());

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/reject")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        assertEquals(initialStock, productRepository.findById(product1.getId()).orElseThrow().getStockQuantity());
    }

    @Test
    @DisplayName("24. Customer can cancel pending order")
    void customerCanCancelPendingOrder() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("25. Cancellation restores stock")
    void cancellationRestoresStock() throws Exception {
        int initialStock = product1.getStockQuantity(); // 10

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(4)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        assertEquals(initialStock - 4, productRepository.findById(product1.getId()).orElseThrow().getStockQuantity());

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk());

        assertEquals(initialStock, productRepository.findById(product1.getId()).orElseThrow().getStockQuantity());
    }

    @Test
    @DisplayName("26. Confirmed order cannot be cancelled by customer")
    void confirmedOrderCannotBeCancelledByCustomer() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        // Shop confirms
        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        // Customer attempts cancel
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("27. Duplicate status transitions are rejected")
    void duplicateStatusTransitionsAreRejected() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> orderResp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String orderId = (String) orderResp.get("id");

        // First confirm succeeds
        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        // Second confirm fails
        mockMvc.perform(patch("/api/shop/orders/" + orderId + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("28. Transaction rollback works when checkout fails")
    void transactionRollbackWorksWhenCheckoutFails() throws Exception {
        // Set product stock to 1
        product1.setStockQuantity(1);
        productRepository.save(product1);

        // Add 2 items (violates stock if checked late)
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product2.getId()) // valid 20 stock
                                .quantity(1)
                                .build())))
                .andExpect(status().isCreated());

        // Manually set invalid product2 stock to test transaction rollback
        product2.setStockQuantity(0);
        product2.setAvailable(false);
        productRepository.save(product2);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest());

        // Cart should still exist with items intact since transaction rolled back
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)));

        // No orders created
        assertEquals(0, orderRepository.count());
    }
}
