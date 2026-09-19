package com.queueless.backend.otp;

import com.queueless.backend.order.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PickupOtpRepository extends JpaRepository<PickupOtp, UUID> {

    Optional<PickupOtp> findByOrder(Order order);

    Optional<PickupOtp> findByOrderAndConsumedFalseAndExpiresAtAfter(Order order, LocalDateTime now);

    Optional<PickupOtp> findByOtpHashAndConsumedFalse(String otpHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT po FROM PickupOtp po WHERE po.otpHash = :otpHash AND po.consumed = false")
    Optional<PickupOtp> findByOtpHashAndConsumedFalseWithLock(@Param("otpHash") String otpHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT po FROM PickupOtp po WHERE po.order = :order")
    Optional<PickupOtp> findByOrderWithLock(@Param("order") Order order);
}
