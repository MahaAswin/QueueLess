package com.queueless.backend.product;

import com.queueless.backend.common.ProductNotFoundException;
import com.queueless.backend.common.ShopNotFoundException;
import com.queueless.backend.product.dto.CreateProductRequest;
import com.queueless.backend.product.dto.ProductResponse;
import com.queueless.backend.product.dto.UpdateProductRequest;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductResponse createProduct(UUID shopId, CreateProductRequest request, String currentUserEmail) {
        User user = getUserByEmail(currentUserEmail);

        if (user.getRole() != Role.SHOP_OWNER) {
            throw new AccessDeniedException("Only shop owners can create products");
        }

        Shop shop = getShopEntityById(shopId);

        if (!shop.getOwner().getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new AccessDeniedException("You are not authorized to add products to this shop");
        }

        validatePrice(request.getPrice());
        validateStockQuantity(request.getStockQuantity());

        Product product = Product.builder()
                .shop(shop)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        Product savedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, UpdateProductRequest request, String currentUserEmail) {
        Product product = getProductEntityById(productId);

        verifyShopOwnership(product.getShop(), currentUserEmail, "update");

        if (request.getPrice() != null) {
            validatePrice(request.getPrice());
            product.setPrice(request.getPrice());
        }

        if (request.getStockQuantity() != null) {
            validateStockQuantity(request.getStockQuantity());
            product.setStockQuantity(request.getStockQuantity());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName());
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        if (request.getCategory() != null) {
            product.setCategory(request.getCategory());
        }

        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        if (request.getAvailable() != null) {
            product.setAvailable(request.getAvailable());
        }

        Product updatedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(updatedProduct);
    }

    @Transactional
    public void deleteProduct(UUID productId, String currentUserEmail) {
        Product product = getProductEntityById(productId);
        verifyShopOwnership(product.getShop(), currentUserEmail, "delete");
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId, String currentUserEmail) {
        Product product = getProductEntityById(productId);

        Shop shop = product.getShop();
        if (shop.getStatus() != ShopStatus.ACTIVE) {
            if (currentUserEmail == null || !shop.getOwner().getEmail().equalsIgnoreCase(currentUserEmail)) {
                throw new ProductNotFoundException("Product not found with ID: " + productId);
            }
        }

        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByShop(UUID shopId, String currentUserEmail) {
        Shop shop = getShopEntityById(shopId);

        if (currentUserEmail != null && shop.getOwner().getEmail().equalsIgnoreCase(currentUserEmail)) {
            return productRepository.findByShop(shop).stream()
                    .map(ProductResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        if (shop.getStatus() != ShopStatus.ACTIVE) {
            return List.of();
        }

        return productRepository.findByShopIdAndShopStatusAndAvailableTrueAndStockQuantityGreaterThan(
                shopId, ShopStatus.ACTIVE, 0).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProductsByShop(UUID shopId) {
        Shop shop = getShopEntityById(shopId);
        if (shop.getStatus() != ShopStatus.ACTIVE) {
            return List.of();
        }

        return productRepository.findByShopIdAndShopStatusAndAvailableTrueAndStockQuantityGreaterThan(
                shopId, ShopStatus.ACTIVE, 0).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String name) {
        if (name == null || name.isBlank()) {
            return List.of();
        }

        return productRepository.findByShopStatusAndAvailableTrueAndStockQuantityGreaterThanAndNameContainingIgnoreCase(
                ShopStatus.ACTIVE, 0, name).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> filterProductsByCategory(ProductCategory category) {
        return productRepository.findByShopStatusAndAvailableTrueAndStockQuantityGreaterThanAndCategory(
                ShopStatus.ACTIVE, 0, category).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse updateAvailability(UUID productId, Boolean available, String currentUserEmail) {
        Product product = getProductEntityById(productId);
        verifyShopOwnership(product.getShop(), currentUserEmail, "change availability of");

        product.setAvailable(available);
        Product savedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(savedProduct);
    }

    @Transactional
    public ProductResponse updateStock(UUID productId, Integer stockQuantity, String currentUserEmail) {
        Product product = getProductEntityById(productId);
        verifyShopOwnership(product.getShop(), currentUserEmail, "update stock of");

        validateStockQuantity(stockQuantity);

        product.setStockQuantity(stockQuantity);
        Product savedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(savedProduct);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private Shop getShopEntityById(UUID shopId) {
        return shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with ID: " + shopId));
    }

    private Product getProductEntityById(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
    }

    private void verifyShopOwnership(Shop shop, String currentUserEmail, String action) {
        if (currentUserEmail == null || !shop.getOwner().getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new AccessDeniedException("You are not authorized to " + action + " products for this shop");
        }
    }

    private void validatePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Product price must be greater than 0");
        }
    }

    private void validateStockQuantity(Integer stockQuantity) {
        if (stockQuantity == null || stockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
    }
}
