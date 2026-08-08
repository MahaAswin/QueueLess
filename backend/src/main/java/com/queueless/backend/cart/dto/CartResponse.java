package com.queueless.backend.cart.dto;

import com.queueless.backend.cart.Cart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private UUID cartId;
    private UUID shopId;
    private String shopName;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private Integer totalItemCount;

    public static CartResponse fromEntity(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(CartItemResponse::fromEntity)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalCount = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        UUID shopId = null;
        String shopName = null;
        if (!cart.getItems().isEmpty()) {
            var firstProduct = cart.getItems().get(0).getProduct();
            if (firstProduct != null && firstProduct.getShop() != null) {
                shopId = firstProduct.getShop().getId();
                shopName = firstProduct.getShop().getShopName();
            }
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .shopId(shopId)
                .shopName(shopName)
                .items(itemResponses)
                .subtotal(subtotal)
                .totalItemCount(totalCount)
                .build();
    }
}
