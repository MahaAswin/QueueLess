package com.queueless.backend.order;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("SELECT oi.product.id, oi.productNameSnapshot, SUM(oi.quantity) FROM OrderItem oi GROUP BY oi.product.id, oi.productNameSnapshot ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopProductsByQuantitySold(Pageable pageable);
}
