package com.queueless.backend.shop;

import com.queueless.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {

    List<Shop> findByOwner(User owner);

    List<Shop> findByStatus(ShopStatus status);

    Page<Shop> findByStatus(ShopStatus status, Pageable pageable);

    List<Shop> findByStatusAndCategory(ShopStatus status, ShopCategory category);

    List<Shop> findByStatusAndCityIgnoreCase(ShopStatus status, String city);

    List<Shop> findByStatusAndShopNameContainingIgnoreCase(ShopStatus status, String name);

    long countByStatus(ShopStatus status);

    long countByValidComplaintCountGreaterThan(int count);

    List<Shop> findTop10ByValidComplaintCountGreaterThanOrderByValidComplaintCountDesc(int count);

    @Query("SELECT s FROM Shop s WHERE " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:city IS NULL OR LOWER(s.city) = LOWER(:city)) AND " +
           "(:search IS NULL OR LOWER(s.shopName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Shop> findAdminShopsFilter(
            @Param("status") ShopStatus status,
            @Param("category") ShopCategory category,
            @Param("city") String city,
            @Param("search") String search,
            Pageable pageable);
}
