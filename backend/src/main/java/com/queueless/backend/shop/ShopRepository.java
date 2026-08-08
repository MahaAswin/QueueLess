package com.queueless.backend.shop;

import com.queueless.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {

    List<Shop> findByOwner(User owner);

    List<Shop> findByStatus(ShopStatus status);

    List<Shop> findByStatusAndCategory(ShopStatus status, ShopCategory category);

    List<Shop> findByStatusAndCityIgnoreCase(ShopStatus status, String city);

    List<Shop> findByStatusAndShopNameContainingIgnoreCase(ShopStatus status, String name);
}
