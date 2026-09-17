package com.queueless.backend.order;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class OrderSpecifications {

    public static Specification<Order> withAdminFilters(
            OrderStatus status,
            UUID shopId,
            Instant from,
            Instant to,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (shopId != null) {
                predicates.add(cb.equal(root.get("shop").get("id"), shopId));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate customerNameMatch = cb.like(cb.lower(root.get("customer").get("fullName")), pattern);
                Predicate customerEmailMatch = cb.like(cb.lower(root.get("customer").get("email")), pattern);
                Predicate shopNameMatch = cb.like(cb.lower(root.get("shop").get("shopName")), pattern);
                Predicate orderIdMatch = cb.like(cb.lower(root.get("id").as(String.class)), pattern);

                predicates.add(cb.or(customerNameMatch, customerEmailMatch, shopNameMatch, orderIdMatch));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
