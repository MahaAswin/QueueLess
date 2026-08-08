package com.queueless.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    long countByRole(Role role);

    long countByAccountStatus(AccountStatus accountStatus);

    long countByRoleAndAccountStatus(Role role, AccountStatus accountStatus);

    long countByValidComplaintCountGreaterThan(int count);

    List<User> findTop10ByValidComplaintCountGreaterThanOrderByValidComplaintCountDesc(int count);

    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:accountStatus IS NULL OR u.accountStatus = :accountStatus) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findAdminUsersFilter(
            @Param("role") Role role,
            @Param("accountStatus") AccountStatus accountStatus,
            @Param("search") String search,
            Pageable pageable);
}
