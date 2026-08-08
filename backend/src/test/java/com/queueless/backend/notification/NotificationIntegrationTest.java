package com.queueless.backend.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.LoginRequest;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
import com.queueless.backend.cart.dto.AddCartItemRequest;
import com.queueless.backend.complaint.Complaint;
import com.queueless.backend.complaint.ComplaintEvidenceRepository;
import com.queueless.backend.complaint.ComplaintRepository;
import com.queueless.backend.complaint.ComplaintStatus;
import com.queueless.backend.complaint.ComplaintType;
import com.queueless.backend.complaint.dto.ReviewComplaintRequest;
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
import com.queueless.backend.slot.PickupSlot;
import com.queueless.backend.slot.PickupSlotRepository;
import com.queueless.backend.slot.PickupSlotStatus;
import com.queueless.backend.slot.dto.CounterProposalRequest;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class NotificationIntegrationTest {

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

    private String customer1Token;
    private String customer2Token;
    private String shopOwner1Token;
    private String adminToken;

    private User customer1;
    private User customer2;
    private User owner1;
    private User admin;

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

        // Admin User
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
    @DisplayName("1. Notification is created for correct recipient")
    void notificationCreatedForCorrectRecipient() throws Exception {
        // Add item to cart
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(AddCartItemRequest.builder()
                                .productId(product1.getId())
                                .quantity(2)
                                .build())))
                .andExpect(status().isCreated());

        // Checkout
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isCreated());

        // Verify shop owner received ORDER_PLACED notification
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].type", is("ORDER_PLACED")))
                .andExpect(jsonPath("$.content[0].title", is("New Order")));
    }

    @Test
    @DisplayName("2. Customer receives order confirmation notification")
    void customerReceivesOrderConfirmationNotification() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].type", is("ORDER_CONFIRMED")));
    }

    @Test
    @DisplayName("3. Shop owner receives new-order notification")
    void shopOwnerReceivesNewOrderNotification() throws Exception {
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


        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)));
    }

    @Test
    @DisplayName("4. Customer receives order rejection notification")
    void customerReceivesOrderRejectionNotification() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/reject")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type", is("ORDER_REJECTED")));
    }

    @Test
    @DisplayName("5. Shop owner receives customer cancellation notification")
    void shopOwnerReceivesCustomerCancellationNotification() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type", is("ORDER_CANCELLED")));
    }

    @Test
    @DisplayName("6. Customer receives pickup-slot notifications")
    void customerReceivesPickupSlotNotifications() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(11, 0))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/accept")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type", is("PICKUP_SLOT_ACCEPTED")));
    }

    @Test
    @DisplayName("7. Shop owner receives pickup-slot response notifications")
    void shopOwnerReceivesPickupSlotResponseNotifications() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(11, 0))
                .proposedDate(LocalDate.now().plusDays(1))
                .proposedStartTime(LocalTime.of(12, 0))
                .proposedEndTime(LocalTime.of(13, 0))
                .status(PickupSlotStatus.COUNTER_PROPOSED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/customer-accept")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type", is("PICKUP_SLOT_CUSTOMER_ACCEPTED")));
    }


    @Test
    @DisplayName("8. Complainant receives complaint review notification")
    void complainantReceivesComplaintReviewNotification() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.CONFIRMED)
                .build());

        Complaint complaint = complaintRepository.save(Complaint.builder()
                .order(order)
                .complainant(customer1)
                .reportedUser(owner1)
                .reportedShop(shop1)
                .type(ComplaintType.SHOP_DELAY)
                .description("Delayed pickup")
                .status(ComplaintStatus.SUBMITTED)
                .build());

        ReviewComplaintRequest req = ReviewComplaintRequest.builder()
                .status(ComplaintStatus.VALID)
                .reviewNote("Verified delay")
                .build();

        mockMvc.perform(patch("/api/admin/complaints/" + complaint.getId() + "/review")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type", is("COMPLAINT_REVIEWED")));
    }

    @Test
    @DisplayName("9. Suspended user receives suspension notification")
    void suspendedUserReceivesSuspensionNotification() throws Exception {
        mockMvc.perform(patch("/api/admin/users/" + customer1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Direct DB inspection or login failure checks, but notification is generated for customer1
        long count = notificationRepository.countByRecipientAndReadFalse(customer1);
        assertEquals(1, count);

        Notification notif = notificationRepository.findByRecipientAndReadFalse(customer1).get(0);
        assertEquals(NotificationType.ACCOUNT_SUSPENDED, notif.getType());
    }

    @Test
    @DisplayName("10. User can retrieve own notifications")
    void userCanRetrieveOwnNotifications() throws Exception {
        mockMvc.perform(patch("/api/admin/users/" + customer1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Reinstate customer 1 so they can log in / authenticate
        mockMvc.perform(patch("/api/admin/users/" + customer1.getId() + "/reinstate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    @Test
    @DisplayName("11. User cannot retrieve another user's notifications")
    void userCannotRetrieveAnotherUsersNotifications() throws Exception {
        mockMvc.perform(patch("/api/admin/users/" + customer1.getId() + "/suspend")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("12. User can mark own notification as read")
    void userCanMarkOwnNotificationAsRead() throws Exception {
        Notification notif = notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("Order Confirmed")
                .message("Your order has been confirmed.")
                .read(false)
                .build());

        mockMvc.perform(patch("/api/notifications/" + notif.getId() + "/read")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read", is(true)))
                .andExpect(jsonPath("$.readAt", notNullValue()));
    }

    @Test
    @DisplayName("13. User cannot mark another user's notification as read")
    void userCannotMarkAnotherUsersNotificationAsRead() throws Exception {
        Notification notif = notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("Order Confirmed")
                .message("Your order has been confirmed.")
                .read(false)
                .build());

        mockMvc.perform(patch("/api/notifications/" + notif.getId() + "/read")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("14. Mark-all-read works")
    void markAllReadWorks() throws Exception {
        notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("Title 1")
                .message("Message 1")
                .read(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_READY_FOR_PICKUP)
                .title("Title 2")
                .message("Message 2")
                .read(false)
                .build());

        mockMvc.perform(patch("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk());

        long unread = notificationRepository.countByRecipientAndReadFalse(customer1);
        assertEquals(0, unread);
    }

    @Test
    @DisplayName("15. Unread count is correct")
    void unreadCountIsCorrect() throws Exception {
        notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("Title 1")
                .message("Message 1")
                .read(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_READY_FOR_PICKUP)
                .title("Title 2")
                .message("Message 2")
                .read(true)
                .build());

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)));
    }

    @Test
    @DisplayName("16. Pagination works")
    void paginationWorks() throws Exception {
        for (int i = 0; i < 5; i++) {
            notificationRepository.save(Notification.builder()
                    .recipient(customer1)
                    .type(NotificationType.ORDER_CONFIRMED)
                    .title("Title " + i)
                    .message("Message " + i)
                    .read(false)
                    .build());
        }

        mockMvc.perform(get("/api/notifications?page=0&size=2")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(2)))
                .andExpect(jsonPath("$.totalElements", is(5)))
                .andExpect(jsonPath("$.totalPages", is(3)))
                .andExpect(jsonPath("$.hasNext", is(true)));
    }

    @Test
    @DisplayName("17. Notifications are ordered newest first")
    void notificationsAreOrderedNewestFirst() throws Exception {
        Notification first = notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("First Notification")
                .message("Message 1")
                .read(false)
                .build());

        Thread.sleep(50);

        Notification second = notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_READY_FOR_PICKUP)
                .title("Second Notification")
                .message("Message 2")
                .read(false)
                .build());


        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id", is(second.getId().toString())))
                .andExpect(jsonPath("$.content[1].id", is(first.getId().toString())));
    }

    @Test
    @DisplayName("18. User can delete own notification")
    void userCanDeleteOwnNotification() throws Exception {
        Notification notif = notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("Order Confirmed")
                .message("Your order has been confirmed.")
                .read(false)
                .build());

        mockMvc.perform(delete("/api/notifications/" + notif.getId())
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isNoContent());

        long count = notificationRepository.count();
        assertEquals(0, count);
    }

    @Test
    @DisplayName("19. User cannot delete another user's notification")
    void userCannotDeleteAnotherUsersNotification() throws Exception {
        Notification notif = notificationRepository.save(Notification.builder()
                .recipient(customer1)
                .type(NotificationType.ORDER_CONFIRMED)
                .title("Order Confirmed")
                .message("Your order has been confirmed.")
                .read(false)
                .build());

        mockMvc.perform(delete("/api/notifications/" + notif.getId())
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("20. Duplicate state transitions do not create duplicate notifications")
    void duplicateStateTransitionsDoNotCreateDuplicateNotifications() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .shop(shop1)
                .totalAmount(new BigDecimal("9.00"))
                .status(OrderStatus.PENDING)
                .build());

        // First confirm
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk());

        // Second confirm (illegal state transition)
        mockMvc.perform(patch("/api/shop/orders/" + order.getId() + "/confirm")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());


        // Verify only 1 notification was created
        long count = notificationRepository.countByRecipientAndReadFalse(customer1);
        assertEquals(1, count);
    }
}
