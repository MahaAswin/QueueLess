package com.queueless.backend.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.admin.dto.UpdateSystemSettingsRequest;
import com.queueless.backend.auth.JwtService;
import com.queueless.backend.setting.SystemSettingRepository;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AdminSettingsIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AdminSettingsService adminSettingsService;

    private MockMvc mockMvc;

    private String adminToken;
    private String customerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        systemSettingRepository.deleteAll();

        // Ensure Admin user
        User admin = userRepository.findByEmail("admin@queueless.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("admin@queueless.com")
                        .fullName("QueueLess Admin")
                        .phone("9990000003")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.ADMIN)
                        .accountStatus(AccountStatus.ACTIVE)
                        .validComplaintCount(0)
                        .build())
        );
        if (admin.getRole() != Role.ADMIN || admin.getAccountStatus() != AccountStatus.ACTIVE) {
            admin.setRole(Role.ADMIN);
            admin.setAccountStatus(AccountStatus.ACTIVE);
            admin = userRepository.save(admin);
        }

        adminToken = jwtService.generateAccessToken(admin);

        // Ensure Customer user
        User customer = userRepository.findByEmail("settings.customer@queueless.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("settings.customer@queueless.com")
                        .fullName("Regular Customer")
                        .phone("9990000088")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.CUSTOMER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .validComplaintCount(0)
                        .build())
        );
        if (customer.getRole() != Role.CUSTOMER || customer.getAccountStatus() != AccountStatus.ACTIVE) {
            customer.setRole(Role.CUSTOMER);
            customer.setAccountStatus(AccountStatus.ACTIVE);
            customer = userRepository.save(customer);
        }

        customerToken = jwtService.generateAccessToken(customer);
    }

    @Test
    @DisplayName("Admin can fetch system settings successfully")
    void testGetSystemSettings() throws Exception {
        mockMvc.perform(get("/api/admin/settings")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trustSettings.userSuspensionThreshold", is(3)))
                .andExpect(jsonPath("$.trustSettings.shopSuspensionThreshold", is(3)))
                .andExpect(jsonPath("$.pickupSettings.qrExpirationMinutes", is(30)))
                .andExpect(jsonPath("$.platformSpecs.defaultAdminEmail", is("admin@queueless.com")))
                .andExpect(jsonPath("$.platformSpecs.databaseEngine", notNullValue()));
    }

    @Test
    @DisplayName("Admin can update runtime thresholds and values persist")
    void testUpdateSystemSettings() throws Exception {
        UpdateSystemSettingsRequest updateReq = UpdateSystemSettingsRequest.builder()
                .userSuspensionThreshold(5)
                .shopSuspensionThreshold(4)
                .qrExpirationMinutes(45)
                .build();

        mockMvc.perform(put("/api/admin/settings")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trustSettings.userSuspensionThreshold", is(5)))
                .andExpect(jsonPath("$.trustSettings.shopSuspensionThreshold", is(4)))
                .andExpect(jsonPath("$.pickupSettings.qrExpirationMinutes", is(45)))
                .andExpect(jsonPath("$.lastUpdatedBy", is("admin@queueless.com")));

        // Verify dynamic getters read new persisted values
        assertEquals(5, adminSettingsService.getUserSuspensionThreshold());
        assertEquals(4, adminSettingsService.getShopSuspensionThreshold());
        assertEquals(45, adminSettingsService.getQrExpirationMinutes());
    }

    @Test
    @DisplayName("Update settings fails on invalid threshold bounds")
    void testUpdateSystemSettingsInvalidBounds() throws Exception {
        UpdateSystemSettingsRequest invalidReq = UpdateSystemSettingsRequest.builder()
                .userSuspensionThreshold(0) // Min is 1
                .shopSuspensionThreshold(25) // Max is 20
                .qrExpirationMinutes(2) // Min is 5
                .build();

        mockMvc.perform(put("/api/admin/settings")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Customer is forbidden from accessing settings")
    void testCustomerForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/settings")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        UpdateSystemSettingsRequest updateReq = UpdateSystemSettingsRequest.builder()
                .userSuspensionThreshold(5)
                .shopSuspensionThreshold(4)
                .qrExpirationMinutes(45)
                .build();

        mockMvc.perform(put("/api/admin/settings")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request receives 401 Unauthorized")
    void testUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/settings"))
                .andExpect(status().isUnauthorized());
    }
}
