package com.queueless.backend.order;

import com.queueless.backend.shop.Shop;
import com.queueless.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);

    List<Order> findByShopOrderByCreatedAtDesc(Shop shop);

    List<Order> findByShopIdOrderByCreatedAtDesc(UUID shopId);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    Page<Order> findByCustomer(User customer, Pageable pageable);

    Page<Order> findByShopIn(List<Shop> shops, Pageable pageable);

    Page<Order> findByShopInAndStatus(List<Shop> shops, OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    long countByCreatedAtBetween(Instant from, Instant to);

    long countByStatusAndCreatedAtBetween(OrderStatus status, Instant from, Instant to);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :from AND :to")
    BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(@Param("status") OrderStatus status, @Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COUNT(DISTINCT o.shop.id) FROM Order o")
    long countDistinctShopsWithOrders();

    @Query("SELECT o.shop.id, o.shop.shopName, COUNT(o) FROM Order o GROUP BY o.shop.id, o.shop.shopName ORDER BY COUNT(o) DESC")
    List<Object[]> findTopShopsByOrderCount(Pageable pageable);
}
