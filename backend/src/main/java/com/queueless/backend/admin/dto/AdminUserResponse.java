package com.queueless.backend.admin.dto;

import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {

    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private AccountStatus accountStatus;
    private int validComplaintCount;
    private Instant createdAt;

    public static AdminUserResponse fromEntity(User user) {
        return AdminUserResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .validComplaintCount(user.getValidComplaintCount())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
