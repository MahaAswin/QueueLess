package com.queueless.backend.cart;

import com.queueless.backend.cart.dto.AddCartItemRequest;
import com.queueless.backend.cart.dto.CartResponse;
import com.queueless.backend.cart.dto.UpdateCartItemRequest;
import com.queueless.backend.common.CartNotFoundException;
import com.queueless.backend.common.ProductNotFoundException;
import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addToCart(AddCartItemRequest request, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> cartRepository.save(Cart.builder().customer(customer).build()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + request.getProductId()));

        if (Boolean.FALSE.equals(product.getAvailable()) || product.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Product is unavailable for purchase");
        }

        // Single-Shop Rule: A cart can contain products from only one shop.
        if (!cart.getItems().isEmpty()) {
            Shop existingShop = cart.getItems().get(0).getProduct().getShop();
            if (!existingShop.getId().equals(product.getShop().getId())) {
                throw new IllegalArgumentException("Cart can contain products from only one shop.");
            }
        }

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        int newTotalQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            newTotalQuantity += existingItemOpt.get().getQuantity();
        }

        if (newTotalQuantity > product.getStockQuantity()) {
            throw new IllegalArgumentException("Insufficient stock. Maximum available: " + product.getStockQuantity());
        }

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(newTotalQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return CartResponse.fromEntity(savedCart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> Cart.builder().customer(customer).build());

        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(UUID itemId, UpdateCartItemRequest request, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new CartNotFoundException("Cart item not found with ID: " + itemId));

        if (!item.getCart().getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this cart item");
        }

        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        Product product = item.getProduct();
        if (Boolean.FALSE.equals(product.getAvailable()) || product.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Product is no longer available");
        }

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new IllegalArgumentException("Insufficient stock. Maximum available: " + product.getStockQuantity());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        Cart cart = item.getCart();
        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public CartResponse removeCartItem(UUID itemId, String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new CartNotFoundException("Cart item not found with ID: " + itemId));

        Cart cart = item.getCart();
        if (!cart.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this cart item");
        }

        cart.getItems().remove(item);
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.fromEntity(savedCart);
    }

    @Transactional
    public CartResponse clearCart(String currentUserEmail) {
        User customer = getCustomerUser(currentUserEmail);

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> Cart.builder().customer(customer).build());

        cart.getItems().clear();
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.fromEntity(savedCart);
    }

    private User getCustomerUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only CUSTOMER users can perform cart operations");
        }
        return user;
    }
}
