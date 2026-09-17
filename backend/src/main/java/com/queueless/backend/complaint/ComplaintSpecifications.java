package com.queueless.backend.complaint;

import com.queueless.backend.order.Order;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.user.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ComplaintSpecifications {

    public static Specification<Complaint> withAdminFilters(
            ComplaintStatus status,
            ComplaintType type,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";

                Join<Complaint, User> complainantJoin = root.join("complainant", JoinType.LEFT);
                Join<Complaint, User> reportedUserJoin = root.join("reportedUser", JoinType.LEFT);
                Join<Complaint, Shop> reportedShopJoin = root.join("reportedShop", JoinType.LEFT);
                Join<Complaint, Order> orderJoin = root.join("order", JoinType.LEFT);

                Predicate complainantNameMatch = cb.like(cb.lower(complainantJoin.get("fullName")), pattern);
                Predicate complainantEmailMatch = cb.like(cb.lower(complainantJoin.get("email")), pattern);
                Predicate reportedUserNameMatch = cb.like(cb.lower(reportedUserJoin.get("fullName")), pattern);
                Predicate reportedUserEmailMatch = cb.like(cb.lower(reportedUserJoin.get("email")), pattern);
                Predicate reportedShopMatch = cb.like(cb.lower(reportedShopJoin.get("shopName")), pattern);
                Predicate descriptionMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate orderIdMatch = cb.like(cb.lower(orderJoin.get("id").as(String.class)), pattern);
                Predicate complaintIdMatch = cb.like(cb.lower(root.get("id").as(String.class)), pattern);

                predicates.add(cb.or(
                        complainantNameMatch,
                        complainantEmailMatch,
                        reportedUserNameMatch,
                        reportedUserEmailMatch,
                        reportedShopMatch,
                        descriptionMatch,
                        orderIdMatch,
                        complaintIdMatch
                ));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
