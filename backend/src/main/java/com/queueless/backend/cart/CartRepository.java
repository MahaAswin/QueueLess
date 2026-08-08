package com.queueless.backend.cart;

import com.queueless.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByCustomer(User customer);

    Optional<Cart> findByCustomerId(UUID customerId);
}
