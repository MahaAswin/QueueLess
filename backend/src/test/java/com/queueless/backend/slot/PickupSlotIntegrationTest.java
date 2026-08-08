package com.queueless.backend.slot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.RefreshTokenRepository;
import com.queueless.backend.auth.dto.RegisterRequest;
import com.queueless.backend.cart.CartItemRepository;
import com.queueless.backend.cart.CartRepository;
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
import com.queueless.backend.slot.dto.CounterProposalRequest;
import com.queueless.backend.slot.dto.CreatePickupSlotRequest;
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
class PickupSlotIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private com.queueless.backend.complaint.ComplaintEvidenceRepository complaintEvidenceRepository;

    @Autowired
    private com.queueless.backend.complaint.ComplaintRepository complaintRepository;

    @Autowired
    private com.queueless.backend.qr.PickupTokenRepository pickupTokenRepository;

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

    private Order order1;
    private Order order2;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

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

        // Shop 1 (Operating Hours: 08:00 to 20:00)
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
    @DisplayName("1. Customer can request slot for own order")
    void customerCanRequestSlotForOwnOrder() throws Exception {
        CreatePickupSlotRequest request = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slotId", notNullValue()))
                .andExpect(jsonPath("$.orderId", is(order1.getId().toString())))
                .andExpect(jsonPath("$.status", is("REQUESTED")))
                .andExpect(jsonPath("$.requestedStartTime", is("10:00:00")))
                .andExpect(jsonPath("$.requestedEndTime", is("10:30:00")));
    }

    @Test
    @DisplayName("2. Customer cannot request slot for another customer's order")
    void customerCannotRequestSlotForAnotherCustomersOrder() throws Exception {
        CreatePickupSlotRequest request = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Shop owner can view slots for their shop")
    void shopOwnerCanViewSlotsForTheirShop() throws Exception {
        pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(11, 0))
                .requestedEndTime(LocalTime.of(11, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        mockMvc.perform(get("/api/shop/pickup-slots")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].orderId", is(order1.getId().toString())));
    }

    @Test
    @DisplayName("4. Shop owner cannot view another shop's slots")
    void shopOwnerCannotViewAnotherShopsSlots() throws Exception {
        pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(11, 0))
                .requestedEndTime(LocalTime.of(11, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        mockMvc.perform(get("/api/shop/pickup-slots")
                        .header("Authorization", "Bearer " + shopOwner2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("5. Shop owner can accept requested slot")
    void shopOwnerCanAcceptRequestedSlot() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(12, 0))
                .requestedEndTime(LocalTime.of(12, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/accept")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.finalStartTime", is("12:00:00")));
    }

    @Test
    @DisplayName("6. Shop owner can reject requested slot")
    void shopOwnerCanRejectRequestedSlot() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(12, 0))
                .requestedEndTime(LocalTime.of(12, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/reject")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SHOP_REJECTED")));
    }

    @Test
    @DisplayName("7. Shop owner can counter-propose")
    void shopOwnerCanCounterPropose() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(12, 0))
                .requestedEndTime(LocalTime.of(12, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        CounterProposalRequest req = CounterProposalRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(14, 30))
                .build();

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/counter-propose")
                        .header("Authorization", "Bearer " + shopOwner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COUNTER_PROPOSED")))
                .andExpect(jsonPath("$.proposedStartTime", is("14:00:00")))
                .andExpect(jsonPath("$.proposedEndTime", is("14:30:00")));
    }

    @Test
    @DisplayName("8. Customer can accept counter-proposal")
    void customerCanAcceptCounterProposal() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(12, 0))
                .requestedEndTime(LocalTime.of(12, 30))
                .proposedDate(LocalDate.now().plusDays(1))
                .proposedStartTime(LocalTime.of(14, 0))
                .proposedEndTime(LocalTime.of(14, 30))
                .status(PickupSlotStatus.COUNTER_PROPOSED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/customer-accept")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CUSTOMER_ACCEPTED")))
                .andExpect(jsonPath("$.finalStartTime", is("14:00:00")));
    }

    @Test
    @DisplayName("9. Customer can reject counter-proposal")
    void customerCanRejectCounterProposal() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(12, 0))
                .requestedEndTime(LocalTime.of(12, 30))
                .proposedDate(LocalDate.now().plusDays(1))
                .proposedStartTime(LocalTime.of(14, 0))
                .proposedEndTime(LocalTime.of(14, 30))
                .status(PickupSlotStatus.COUNTER_PROPOSED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/customer-reject")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CUSTOMER_REJECTED")));
    }

    @Test
    @DisplayName("10. Invalid state transitions are rejected")
    void invalidStateTransitionsAreRejected() throws Exception {
        // ACCEPTED slot cannot be accepted again or counter-proposed
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(12, 0))
                .requestedEndTime(LocalTime.of(12, 30))
                .status(PickupSlotStatus.ACCEPTED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/accept")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("11. Start time must be before end time")
    void startTimeMustBeBeforeEndTime() throws Exception {
        CreatePickupSlotRequest req = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(14, 0)) // Invalid: start after end
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("12. Pickup date cannot be in the past")
    void pickupDateCannotBeInThePast() throws Exception {
        CreatePickupSlotRequest req = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().minusDays(1)) // Past date
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("13. Slot must be within shop operating hours")
    void slotMustBeWithinShopOperatingHours() throws Exception {
        // Shop operating hours are 08:00 to 20:00
        CreatePickupSlotRequest req = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(6, 0)) // Too early
                .endTime(LocalTime.of(6, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("14. Duplicate active slot is rejected")
    void duplicateActiveSlotIsRejected() throws Exception {
        pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(10, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        CreatePickupSlotRequest secondReq = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(11, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("15. Cancelled order cannot receive pickup slot")
    void cancelledOrderCannotReceivePickupSlot() throws Exception {
        order1.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order1);

        CreatePickupSlotRequest req = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("16. Rejected order cannot receive pickup slot")
    void rejectedOrderCannotReceivePickupSlot() throws Exception {
        order1.setStatus(OrderStatus.REJECTED);
        orderRepository.save(order1);

        CreatePickupSlotRequest req = CreatePickupSlotRequest.builder()
                .pickupDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .build();

        mockMvc.perform(post("/api/orders/" + order1.getId() + "/pickup-slot")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("17. Customer cannot accept another customer's counter-proposal")
    void customerCannotAcceptAnotherCustomersCounterProposal() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1) // Customer 1
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(10, 30))
                .proposedDate(LocalDate.now().plusDays(1))
                .proposedStartTime(LocalTime.of(11, 0))
                .proposedEndTime(LocalTime.of(11, 30))
                .status(PickupSlotStatus.COUNTER_PROPOSED)
                .build());

        // Customer 2 attempts to accept Customer 1's counter-proposal
        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/customer-accept")
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("18. Shop owner cannot modify another shop's slot")
    void shopOwnerCannotModifyAnotherShopsSlot() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1) // Shop 1
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(10, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        // Owner 2 attempts to accept Shop 1's slot
        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/accept")
                        .header("Authorization", "Bearer " + shopOwner2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("19. Final pickup time is returned correctly")
    void finalPickupTimeIsReturnedCorrectly() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(10, 0))
                .requestedEndTime(LocalTime.of(10, 30))
                .status(PickupSlotStatus.REQUESTED)
                .build());

        mockMvc.perform(patch("/api/pickup-slots/" + slot.getId() + "/accept")
                        .header("Authorization", "Bearer " + shopOwner1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalPickupDate", is(LocalDate.now().plusDays(1).toString())))
                .andExpect(jsonPath("$.finalStartTime", is("10:00:00")))
                .andExpect(jsonPath("$.finalEndTime", is("10:30:00")));
    }

    @Test
    @DisplayName("20. Database relationship between Order and PickupSlot works")
    void databaseRelationshipBetweenOrderAndPickupSlotWorks() throws Exception {
        PickupSlot slot = pickupSlotRepository.save(PickupSlot.builder()
                .order(order1)
                .pickupDate(LocalDate.now().plusDays(1))
                .requestedStartTime(LocalTime.of(9, 0))
                .requestedEndTime(LocalTime.of(9, 30))
                .status(PickupSlotStatus.ACCEPTED)
                .build());

        PickupSlot fetched = pickupSlotRepository.findByOrder(order1).orElseThrow();
        assertEquals(slot.getId(), fetched.getId());
        assertEquals(order1.getId(), fetched.getOrder().getId());
    }
}
