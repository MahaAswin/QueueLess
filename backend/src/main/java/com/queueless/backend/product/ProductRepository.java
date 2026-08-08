package com.queueless.backend.product;

import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByShop(Shop shop);

    List<Product> findByShopId(UUID shopId);

    List<Product> findByShopIdAndAvailableTrueAndStockQuantityGreaterThan(UUID shopId, int stockQuantity);

    List<Product> findByShopIdAndShopStatus(UUID shopId, ShopStatus shopStatus);

    List<Product> findByShopIdAndShopStatusAndAvailableTrueAndStockQuantityGreaterThan(UUID shopId, ShopStatus shopStatus, int stockQuantity);

    List<Product> findByShopStatusAndAvailableTrueAndStockQuantityGreaterThanAndNameContainingIgnoreCase(ShopStatus shopStatus, int stockQuantity, String name);

    List<Product> findByShopStatusAndAvailableTrueAndStockQuantityGreaterThanAndCategory(ShopStatus shopStatus, int stockQuantity, ProductCategory category);

    List<Product> findByShopIdAndCategory(UUID shopId, ProductCategory category);

    long countByAvailableTrue();

    long countByAvailableFalse();

    long countByStockQuantity(int stockQuantity);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") UUID id);
}
