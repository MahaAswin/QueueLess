package com.queueless.backend.complaint;

import com.queueless.backend.order.Order;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    List<Complaint> findByComplainant(User complainant);

    List<Complaint> findByComplainantOrderByCreatedAtDesc(User complainant);

    List<Complaint> findByReportedUser(User reportedUser);

    List<Complaint> findByReportedShop(Shop reportedShop);

    List<Complaint> findByOrder(Order order);

    List<Complaint> findByStatus(ComplaintStatus status);

    long countByStatus(ComplaintStatus status);

    long countByReportedUserAndStatus(User reportedUser, ComplaintStatus status);

    long countByReportedShopAndStatus(Shop reportedShop, ComplaintStatus status);

    Page<Complaint> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT c.type, COUNT(c) FROM Complaint c GROUP BY c.type")
    List<Object[]> countComplaintsGroupedByType();
}
