package com.queueless.backend.product;

import com.queueless.backend.product.dto.CreateProductRequest;
import com.queueless.backend.product.dto.ProductResponse;
import com.queueless.backend.product.dto.UpdateAvailabilityRequest;
import com.queueless.backend.product.dto.UpdateProductRequest;
import com.queueless.backend.product.dto.UpdateStockRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/shops/{shopId}/products")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ProductResponse> createProduct(
            @PathVariable UUID shopId,
            @Valid @RequestBody CreateProductRequest request,
            Authentication authentication) {
        ProductResponse response = productService.createProduct(shopId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/products/{productId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request,
            Authentication authentication) {
        ProductResponse response = productService.updateProduct(productId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/products/{productId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable UUID productId,
            Authentication authentication) {
        productService.deleteProduct(productId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/products/{productId}/availability")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ProductResponse> updateAvailability(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateAvailabilityRequest request,
            Authentication authentication) {
        ProductResponse response = productService.updateAvailability(productId, request.getAvailable(), authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/products/{productId}/stock")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateStockRequest request,
            Authentication authentication) {
        ProductResponse response = productService.updateStock(productId, request.getStockQuantity(), authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shops/{shopId}/products")
    public ResponseEntity<List<ProductResponse>> getProductsByShop(
            @PathVariable UUID shopId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        List<ProductResponse> response = productService.getProductsByShop(shopId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable UUID productId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ProductResponse response = productService.getProductById(productId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam(required = false, name = "name") String name,
            @RequestParam(required = false, name = "query") String query) {
        String searchTerm = name != null ? name : query;
        List<ProductResponse> response = productService.searchProducts(searchTerm);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<ProductResponse>> filterProductsByCategory(
            @PathVariable ProductCategory category) {
        List<ProductResponse> response = productService.filterProductsByCategory(category);
        return ResponseEntity.ok(response);
    }
}
