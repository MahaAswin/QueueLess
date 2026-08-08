package com.queueless.backend.slot;

import com.queueless.backend.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PickupSlotRepository extends JpaRepository<PickupSlot, UUID> {

    Optional<PickupSlot> findByOrder(Order order);

    Optional<PickupSlot> findByOrderId(UUID orderId);

    List<PickupSlot> findByOrderShopIdOrderByCreatedAtDesc(UUID shopId);

    List<PickupSlot> findByStatus(PickupSlotStatus status);
}
