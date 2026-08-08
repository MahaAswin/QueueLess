package com.queueless.backend.cart;

import com.queueless.backend.cart.dto.AddCartItemRequest;
import com.queueless.backend.cart.dto.CartResponse;
import com.queueless.backend.cart.dto.UpdateCartItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddCartItemRequest request,
            Authentication authentication) {
        CartResponse response = cartService.addToCart(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        CartResponse response = cartService.getCart(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            Authentication authentication) {
        CartResponse response = cartService.updateCartItemQuantity(itemId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable UUID itemId,
            Authentication authentication) {
        CartResponse response = cartService.removeCartItem(itemId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> clearCart(Authentication authentication) {
        CartResponse response = cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
