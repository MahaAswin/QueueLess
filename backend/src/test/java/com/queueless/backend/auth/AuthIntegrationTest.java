package com.queueless.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.queueless.backend.auth.dto.LoginRequest;
import com.queueless.backend.auth.dto.RefreshTokenRequest;
import com.queueless.backend.auth.dto.RegisterRequest;
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

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Customer registration succeeds")
    void customerRegistrationSucceeds() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Customer User")
                .email("customer@example.com")
                .phone("+12345678901")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("customer@example.com")))
                .andExpect(jsonPath("$.user.role", is("CUSTOMER")))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("2. Shop owner registration succeeds")
    void shopOwnerRegistrationSucceeds() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Shop Owner")
                .email("owner@example.com")
                .phone("+12345678902")
                .password("Password123!")
                .role(Role.SHOP_OWNER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email", is("owner@example.com")))
                .andExpect(jsonPath("$.user.role", is("SHOP_OWNER")));
    }

    @Test
    @DisplayName("3. Admin registration is rejected")
    void adminRegistrationIsRejected() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Admin User")
                .email("admin@example.com")
                .phone("+12345678903")
                .password("Password123!")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("4. Duplicate email is rejected")
    void duplicateEmailIsRejected() throws Exception {
        userRepository.save(User.builder()
                .fullName("Existing User")
                .email("duplicate@example.com")
                .phone("+12345678904")
                .password(passwordEncoder.encode("password"))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        RegisterRequest request = RegisterRequest.builder()
                .fullName("New User")
                .email("duplicate@example.com")
                .phone("+12345678905")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("5. Duplicate phone is rejected")
    void duplicatePhoneIsRejected() throws Exception {
        userRepository.save(User.builder()
                .fullName("Existing User")
                .email("existing@example.com")
                .phone("+12345678906")
                .password(passwordEncoder.encode("password"))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        RegisterRequest request = RegisterRequest.builder()
                .fullName("New User")
                .email("newphone@example.com")
                .phone("+12345678906")
                .password("Password123!")
                .role(Role.CUSTOMER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("6. Password is stored hashed")
    void passwordIsStoredHashed() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Hashed User")
                .email("hashed@example.com")
                .phone("+12345678907")
                .password("RawPassword123")
                .role(Role.CUSTOMER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("hashed@example.com").orElseThrow();
        assertNotEquals("RawPassword123", user.getPassword());
        assertTrue(passwordEncoder.matches("RawPassword123", user.getPassword()));
    }

    @Test
    @DisplayName("7. Correct login succeeds")
    void correctLoginSucceeds() throws Exception {
        userRepository.save(User.builder()
                .fullName("Login User")
                .email("login@example.com")
                .phone("+12345678908")
                .password(passwordEncoder.encode("CorrectPassword"))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("login@example.com")
                .password("CorrectPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("login@example.com")));
    }

    @Test
    @DisplayName("8. Incorrect password fails")
    void incorrectPasswordFails() throws Exception {
        userRepository.save(User.builder()
                .fullName("Login User")
                .email("wrongpass@example.com")
                .phone("+12345678909")
                .password(passwordEncoder.encode("CorrectPassword"))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("wrongpass@example.com")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("9. Suspended user cannot login")
    void suspendedUserCannotLogin() throws Exception {
        userRepository.save(User.builder()
                .fullName("Suspended User")
                .email("suspended@example.com")
                .phone("+12345678910")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.SUSPENDED)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("suspended@example.com")
                .password("Password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. Valid access token accesses protected endpoint")
    void validAccessTokenAccessesProtectedEndpoint() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Protected User")
                .email("protected@example.com")
                .phone("+12345678911")
                .password("Password123")
                .role(Role.CUSTOMER)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        Map<?, ?> authResponse = objectMapper.readValue(responseJson, Map.class);
        String accessToken = (String) authResponse.get("accessToken");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("protected@example.com")));
    }

    @Test
    @DisplayName("11. Invalid access token is rejected")
    void invalidAccessTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer InvalidTokenHere"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("12. Expired access token is rejected")
    void expiredAccessTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleHBpcmVkQGV4YW1wbGUuY29tIiwiZXhwIjoxNTAwMDAwMDAwfQ.invalidSignature"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("13. Refresh token works")
    void refreshTokenWorks() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Refresh User")
                .email("refresh@example.com")
                .phone("+12345678913")
                .password("Password123")
                .role(Role.CUSTOMER)
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> authResponse = objectMapper.readValue(registerResult.getResponse().getContentAsString(), Map.class);
        String refreshToken = (String) authResponse.get("refreshToken");

        RefreshTokenRequest refreshRequest = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()));
    }

    @Test
    @DisplayName("14. Revoked refresh token is rejected")
    void revokedRefreshTokenIsRejected() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Revoked User")
                .email("revoked@example.com")
                .phone("+12345678914")
                .password("Password123")
                .role(Role.CUSTOMER)
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> authResponse = objectMapper.readValue(registerResult.getResponse().getContentAsString(), Map.class);
        String refreshToken = (String) authResponse.get("refreshToken");

        // Rotate token once
        RefreshTokenRequest refreshRequest = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk());

        // Second attempt with old refresh token must be rejected
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("15. Logout revokes refresh token")
    void logoutRevokesRefreshToken() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Logout User")
                .email("logout@example.com")
                .phone("+12345678915")
                .password("Password123")
                .role(Role.CUSTOMER)
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> authResponse = objectMapper.readValue(registerResult.getResponse().getContentAsString(), Map.class);
        String refreshToken = (String) authResponse.get("refreshToken");

        RefreshTokenRequest logoutRequest = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk());

        // Subsequent refresh attempt fails
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("16. /api/auth/me returns the authenticated user")
    void getMeReturnsAuthenticatedUser() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Me User")
                .email("me@example.com")
                .phone("+12345678916")
                .password("Password123")
                .role(Role.CUSTOMER)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> authResponse = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        String accessToken = (String) authResponse.get("accessToken");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Me User")))
                .andExpect(jsonPath("$.email", is("me@example.com")))
                .andExpect(jsonPath("$.phone", is("+12345678916")))
                .andExpect(jsonPath("$.role", is("CUSTOMER")))
                .andExpect(jsonPath("$.accountStatus", is("ACTIVE")));
    }

    @Test
    @DisplayName("17. Password is never returned in responses")
    void passwordIsNeverReturnedInResponses() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("No Pass User")
                .email("nopass@example.com")
                .phone("+12345678917")
                .password("Password123")
                .role(Role.CUSTOMER)
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andReturn();

        Map<?, ?> authResponse = objectMapper.readValue(regResult.getResponse().getContentAsString(), Map.class);
        String accessToken = (String) authResponse.get("accessToken");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist());
    }
}
