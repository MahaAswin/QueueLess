package com.queueless.backend.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.product.dto.CreateProductRequest;
import com.queueless.backend.product.dto.UpdateAvailabilityRequest;
import com.queueless.backend.product.dto.UpdateProductRequest;
import com.queueless.backend.product.dto.UpdateStockRequest;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class ProductIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

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
    private com.queueless.backend.order.OrderItemRepository orderItemRepository;

    @Autowired
    private com.queueless.backend.order.OrderRepository orderRepository;

    @Autowired
    private com.queueless.backend.cart.CartItemRepository cartItemRepository;

    @Autowired
    private com.queueless.backend.cart.CartRepository cartRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private MockMvc mockMvc;

    private String shopOwnerToken;
    private String secondOwnerToken;
    private String customerToken;

    private User owner1;
    private User owner2;
    private Shop owner1Shop;
    private Shop owner2Shop;

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


        // Register SHOP_OWNER 1
        RegisterRequest owner1Req = RegisterRequest.builder()
                .fullName("Owner One")
                .email("owner1@example.com")
                .phone("+12345678901")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build();
        shopOwnerToken = obtainToken(owner1Req);
        owner1 = userRepository.findByEmail("owner1@example.com").orElseThrow();

        // Register SHOP_OWNER 2
        RegisterRequest owner2Req = RegisterRequest.builder()
                .fullName("Owner Two")
                .email("owner2@example.com")
                .phone("+12345678902")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build();
        secondOwnerToken = obtainToken(owner2Req);
        owner2 = userRepository.findByEmail("owner2@example.com").orElseThrow();

        // Register CUSTOMER
        RegisterRequest customerReq = RegisterRequest.builder()
                .fullName("Customer One")
                .email("customer1@example.com")
                .phone("+12345678903")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build();
        customerToken = obtainToken(customerReq);

        // Create Active Shop for Owner 1
        owner1Shop = shopRepository.save(Shop.builder()
                .owner(owner1)
                .shopName("Owner One Active Supermarket")
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

        // Create Active Shop for Owner 2
        owner2Shop = shopRepository.save(Shop.builder()
                .owner(owner2)
                .shopName("Owner Two Active Bakery")
                .category(ShopCategory.BAKERY)
                .phone("+12345678911")
                .address("200 Bakery Ave")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(7, 0))
                .closingTime(LocalTime.of(19, 0))
                .status(ShopStatus.ACTIVE)
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
    @DisplayName("1. Shop owner can create product")
    void shopOwnerCanCreateProduct() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Organic Apples")
                .description("Fresh red apples")
                .price(new BigDecimal("3.99"))
                .stockQuantity(50)
                .category(ProductCategory.FRUITS_VEGETABLES)
                .imageUrl("http://example.com/apple.jpg")
                .available(true)
                .build();

        mockMvc.perform(post("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Organic Apples")))
                .andExpect(jsonPath("$.shopId", is(owner1Shop.getId().toString())))
                .andExpect(jsonPath("$.shopName", is("Owner One Active Supermarket")))
                .andExpect(jsonPath("$.price", is(3.99)))
                .andExpect(jsonPath("$.stockQuantity", is(50)))
                .andExpect(jsonPath("$.category", is("FRUITS_VEGETABLES")))
                .andExpect(jsonPath("$.available", is(true)));
    }

    @Test
    @DisplayName("2. Customer cannot create product")
    void customerCannotCreateProduct() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Unauthorized Item")
                .price(new BigDecimal("10.00"))
                .stockQuantity(5)
                .category(ProductCategory.OTHER)
                .build();

        mockMvc.perform(post("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Unauthenticated user cannot create product")
    void unauthenticatedUserCannotCreateProduct() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("No Auth Item")
                .price(new BigDecimal("5.00"))
                .stockQuantity(10)
                .category(ProductCategory.SNACKS)
                .build();

        mockMvc.perform(post("/api/shops/" + owner1Shop.getId() + "/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. Owner cannot create a product for another owner's shop")
    void ownerCannotCreateProductForAnotherOwnersShop() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Stolen Product")
                .price(new BigDecimal("15.00"))
                .stockQuantity(20)
                .category(ProductCategory.GROCERY)
                .build();

        mockMvc.perform(post("/api/shops/" + owner2Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Product is correctly linked to shop")
    void productIsCorrectlyLinkedToShop() throws Exception {
        Product product = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Whole Milk")
                .price(new BigDecimal("2.49"))
                .stockQuantity(30)
                .category(ProductCategory.DAIRY)
                .available(true)
                .build());

        mockMvc.perform(get("/api/products/" + product.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shopId", is(owner1Shop.getId().toString())))
                .andExpect(jsonPath("$.shopName", is(owner1Shop.getShopName())));
    }

    @Test
    @DisplayName("6. Product price is stored correctly")
    void productPriceIsStoredCorrectly() throws Exception {
        BigDecimal exactPrice = new BigDecimal("1234.56");
        Product product = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Expensive Perfume")
                .price(exactPrice)
                .stockQuantity(5)
                .category(ProductCategory.PERSONAL_CARE)
                .available(true)
                .build());

        mockMvc.perform(get("/api/products/" + product.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price", is(1234.56)));
    }

    @Test
    @DisplayName("7. Invalid price is rejected")
    void invalidPriceIsRejected() throws Exception {
        CreateProductRequest zeroPriceRequest = CreateProductRequest.builder()
                .name("Free Item")
                .price(new BigDecimal("0.00"))
                .stockQuantity(10)
                .category(ProductCategory.SNACKS)
                .build();

        mockMvc.perform(post("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(zeroPriceRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("8. Negative stock is rejected")
    void negativeStockIsRejected() throws Exception {
        CreateProductRequest negativeStockRequest = CreateProductRequest.builder()
                .name("Ghost Item")
                .price(new BigDecimal("10.00"))
                .stockQuantity(-5)
                .category(ProductCategory.GROCERY)
                .build();

        mockMvc.perform(post("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(negativeStockRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("9. Owner can update own product")
    void ownerCanUpdateOwnProduct() throws Exception {
        Product product = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Old Product Name")
                .price(new BigDecimal("5.00"))
                .stockQuantity(10)
                .category(ProductCategory.GROCERY)
                .available(true)
                .build());

        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .name("Updated Product Name")
                .price(new BigDecimal("7.50"))
                .stockQuantity(25)
                .build();

        mockMvc.perform(put("/api/products/" + product.getId())
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Product Name")))
                .andExpect(jsonPath("$.price", is(7.50)))
                .andExpect(jsonPath("$.stockQuantity", is(25)));
    }

    @Test
    @DisplayName("10. Owner cannot update another owner's product")
    void ownerCannotUpdateAnotherOwnersProduct() throws Exception {
        Product product = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Owner One Product")
                .price(new BigDecimal("10.00"))
                .stockQuantity(10)
                .category(ProductCategory.GROCERY)
                .available(true)
                .build());

        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .name("Hacked Product")
                .build();

        mockMvc.perform(put("/api/products/" + product.getId())
                        .header("Authorization", "Bearer " + secondOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11. Owner can delete own product")
    void ownerCanDeleteOwnProduct() throws Exception {
        Product product = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Product to Delete")
                .price(new BigDecimal("4.00"))
                .stockQuantity(10)
                .category(ProductCategory.SNACKS)
                .available(true)
                .build());

        mockMvc.perform(delete("/api/products/" + product.getId())
                        .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isNoContent());

        assertFalse(productRepository.existsById(product.getId()));
    }

    @Test
    @DisplayName("12. Customer can view products")
    void customerCanViewProducts() throws Exception {
        productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Orange Juice")
                .price(new BigDecimal("3.50"))
                .stockQuantity(15)
                .category(ProductCategory.BEVERAGES)
                .available(true)
                .build());

        mockMvc.perform(get("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Orange Juice")));
    }

    @Test
    @DisplayName("13. Customer can view only products from valid/active shops")
    void customerCanViewOnlyProductsFromValidActiveShops() throws Exception {
        // Pending shop
        Shop pendingShop = shopRepository.save(Shop.builder()
                .owner(owner1)
                .shopName("Pending Market")
                .category(ShopCategory.GROCERY)
                .phone("+12345678912")
                .address("300 Pending Rd")
                .city("Metropolis")
                .latitude(40.7128)
                .longitude(-74.0060)
                .openingTime(LocalTime.of(8, 0))
                .closingTime(LocalTime.of(20, 0))
                .status(ShopStatus.PENDING)
                .build());

        productRepository.save(Product.builder()
                .shop(pendingShop)
                .name("Hidden Cereal")
                .price(new BigDecimal("5.00"))
                .stockQuantity(20)
                .category(ProductCategory.GROCERY)
                .available(true)
                .build());

        mockMvc.perform(get("/api/shops/" + pendingShop.getId() + "/products")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("14. Search by product name works")
    void searchByProductNameWorks() throws Exception {
        productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Dark Chocolate")
                .price(new BigDecimal("2.99"))
                .stockQuantity(20)
                .category(ProductCategory.SNACKS)
                .available(true)
                .build());

        productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("White Bread")
                .price(new BigDecimal("1.99"))
                .stockQuantity(15)
                .category(ProductCategory.BAKERY)
                .available(true)
                .build());

        mockMvc.perform(get("/api/products/search?name=choc")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Dark Chocolate")));
    }

    @Test
    @DisplayName("15. Category filtering works")
    void categoryFilteringWorks() throws Exception {
        productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Paracetamol")
                .price(new BigDecimal("4.99"))
                .stockQuantity(100)
                .category(ProductCategory.MEDICINE)
                .available(true)
                .build());

        productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Potato Chips")
                .price(new BigDecimal("1.50"))
                .stockQuantity(50)
                .category(ProductCategory.SNACKS)
                .available(true)
                .build());

        mockMvc.perform(get("/api/products/category/MEDICINE")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Paracetamol")));
    }

    @Test
    @DisplayName("16. Availability filtering works")
    void availabilityFilteringWorks() throws Exception {
        Product p1 = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Available Soda")
                .price(new BigDecimal("1.99"))
                .stockQuantity(10)
                .category(ProductCategory.BEVERAGES)
                .available(true)
                .build());

        UpdateAvailabilityRequest availReq = UpdateAvailabilityRequest.builder()
                .available(false)
                .build();

        mockMvc.perform(patch("/api/products/" + p1.getId() + "/availability")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(false)));

        // Customer fetching products for shop should not see unavailable product
        mockMvc.perform(get("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("17. Stock update works")
    void stockUpdateWorks() throws Exception {
        Product product = productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Notebook")
                .price(new BigDecimal("3.00"))
                .stockQuantity(5)
                .category(ProductCategory.STATIONERY)
                .available(true)
                .build());

        UpdateStockRequest stockReq = UpdateStockRequest.builder()
                .stockQuantity(100)
                .build();

        mockMvc.perform(patch("/api/products/" + product.getId() + "/stock")
                        .header("Authorization", "Bearer " + shopOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stockReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockQuantity", is(100)));
    }

    @Test
    @DisplayName("18. Product with zero stock is not treated as available")
    void productWithZeroStockIsNotTreatedAsAvailable() throws Exception {
        productRepository.save(Product.builder()
                .shop(owner1Shop)
                .name("Out of Stock Cookies")
                .price(new BigDecimal("2.50"))
                .stockQuantity(0)
                .category(ProductCategory.SNACKS)
                .available(true)
                .build());

        // Customer shop products list excludes stock=0
        mockMvc.perform(get("/api/shops/" + owner1Shop.getId() + "/products")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("19. Nonexistent product returns proper error")
    void nonexistentProductReturnsProperError() throws Exception {
        UUID randomId = UUID.randomUUID();

        mockMvc.perform(get("/api/products/" + randomId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isNotFound());
    }
}
