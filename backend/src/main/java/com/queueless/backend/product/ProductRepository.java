package com.queueless.backend.product;

import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
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
}
