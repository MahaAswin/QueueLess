package com.queueless.backend.qr;

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
public interface PickupTokenRepository extends JpaRepository<PickupToken, UUID> {

    Optional<PickupToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pt FROM PickupToken pt WHERE pt.tokenHash = :tokenHash")
    Optional<PickupToken> findByTokenHashWithLock(@Param("tokenHash") String tokenHash);

    Optional<PickupToken> findByOrder(Order order);

    Optional<PickupToken> findByOrderAndUsedFalseAndExpiresAtAfter(Order order, LocalDateTime now);
}
