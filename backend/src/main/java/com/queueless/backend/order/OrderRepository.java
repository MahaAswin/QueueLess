package com.queueless.backend.order;

import com.queueless.backend.shop.Shop;
import com.queueless.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}
