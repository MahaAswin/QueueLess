package com.queueless.backend.config;

import com.queueless.backend.product.Product;
import com.queueless.backend.product.ProductCategory;
import com.queueless.backend.product.ProductRepository;
import com.queueless.backend.shop.Shop;
import com.queueless.backend.shop.ShopCategory;
import com.queueless.backend.shop.ShopRepository;
import com.queueless.backend.shop.ShopStatus;
import com.queueless.backend.user.AccountStatus;
import com.queueless.backend.user.Role;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DevelopmentDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking and initializing QueueLess development test catalog data...");

        try {
            // 1. Initialize Test Users (Customer, Shop Owner, Admin)
            User customer = getOrCreateUser(
                    "customer@queueless.com",
                    "Test Customer",
                    "9990000001",
                    "password123",
                    Role.CUSTOMER
            );

            User owner = getOrCreateUser(
                    "owner@campuscafe.com",
                    "Campus Cafe Owner",
                    "9990000002",
                    "password123",
                    Role.SHOP_OWNER
            );

            // Initial account for admin as standard user (promoted by AdminPromotionInitializer)
            getOrCreateUser(
                    "admin@queueless.com",
                    "QueueLess Admin",
                    "9990000003",
                    "password123",
                    Role.CUSTOMER
            );

            // 2. Initialize Campus Cafe Shop (Active)
            Shop campusCafe = getOrCreateShop(
                    owner,
                    "Campus Cafe",
                    "Campus dining & cafeteria serving fresh South Indian breakfast, snacks, hot beverages, and fresh juices.",
                    ShopCategory.RESTAURANT,
                    "9990000002",
                    "Student Activity Center, Campus Ground Floor",
                    "Bangalore",
                    12.9716,
                    77.5946,
                    LocalTime.of(7, 30),
                    LocalTime.of(22, 0),
                    ShopStatus.ACTIVE
            );

            // 3. Initialize Fresh Bakery Shop (Pending approval for Admin verification testing)
            getOrCreateShop(
                    owner,
                    "Campus Bakery & Snacks",
                    "Fresh artisan breads, pastries, cookies, and evening snacks for campus students.",
                    ShopCategory.BAKERY,
                    "9990000002",
                    "Block B Commercial Complex, Room 102",
                    "Bangalore",
                    12.9720,
                    77.5950,
                    LocalTime.of(8, 0),
                    LocalTime.of(20, 0),
                    ShopStatus.PENDING
            );

            // 3. Initialize Required Test Products for Campus Cafe
            seedProduct(
                    campusCafe,
                    "Masala Dosa",
                    "Crispy golden rice crepe filled with spiced potato masala, served with sambar and fresh coconut chutney.",
                    new BigDecimal("50.00"),
                    100,
                    ProductCategory.RESTAURANT,
                    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80"
            );

            seedProduct(
                    campusCafe,
                    "Idli",
                    "Steamed fluffy rice-lentil cakes served with piping hot sambar and traditional chutney.",
                    new BigDecimal("35.00"),
                    100,
                    ProductCategory.RESTAURANT,
                    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"
            );

            seedProduct(
                    campusCafe,
                    "Vada",
                    "Crispy deep-fried savory medu vada spiced with black pepper, curry leaves, and ginger.",
                    new BigDecimal("30.00"),
                    100,
                    ProductCategory.RESTAURANT,
                    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
            );

            seedProduct(
                    campusCafe,
                    "Veg Sandwich",
                    "Toasted bread with fresh cucumber, tomato, mint chutney, and mild spices.",
                    new BigDecimal("60.00"),
                    100,
                    ProductCategory.SNACKS,
                    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80"
            );

            seedProduct(
                    campusCafe,
                    "Tea",
                    "Traditional brewed masala chai with milk, cardamom, and fresh ginger.",
                    new BigDecimal("15.00"),
                    200,
                    ProductCategory.BEVERAGES,
                    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"
            );

            seedProduct(
                    campusCafe,
                    "Coffee",
                    "Freshly brewed South Indian filter coffee with frothy hot milk.",
                    new BigDecimal("25.00"),
                    200,
                    ProductCategory.BEVERAGES,
                    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
            );

            seedProduct(
                    campusCafe,
                    "Fresh Lime Juice",
                    "Chilled freshly squeezed lime juice with mint and sugar or salt.",
                    new BigDecimal("30.00"),
                    100,
                    ProductCategory.BEVERAGES,
                    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
            );

            log.info("QueueLess development test catalog initialized successfully with shop [{}] (ID: {}) and active test products.",
                    campusCafe.getShopName(), campusCafe.getId());
        } catch (Exception e) {
            log.error("Failed to initialize development test catalog data: {}", e.getMessage(), e);
        }
    }

    private User getOrCreateUser(String email, String fullName, String phone, String rawPassword, Role role) {
        // 1. Check if user exists by email
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            if (user.getRole() != Role.ADMIN && (user.getRole() != role || user.getAccountStatus() != AccountStatus.ACTIVE)) {
                user.setRole(role);
                user.setAccountStatus(AccountStatus.ACTIVE);
                return userRepository.save(user);
            }
            return user;
        }

        // 2. Check if user exists with this phone number to avoid unique constraint collisions
        Optional<User> existingByPhone = userRepository.findByPhone(phone);
        if (existingByPhone.isPresent()) {
            User user = existingByPhone.get();
            if (user.getRole() != Role.ADMIN && (user.getRole() != role || user.getAccountStatus() != AccountStatus.ACTIVE)) {
                user.setRole(role);
                user.setAccountStatus(AccountStatus.ACTIVE);
                return userRepository.save(user);
            }
            return user;
        }

        // 3. Create new user if neither email nor phone exists
        User newUser = User.builder()
                .email(email)
                .fullName(fullName)
                .phone(phone)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .accountStatus(AccountStatus.ACTIVE)
                .validComplaintCount(0)
                .build();

        return userRepository.save(newUser);
    }

    private Shop getOrCreateShop(
            User owner,
            String shopName,
            String description,
            ShopCategory category,
            String phone,
            String address,
            String city,
            Double latitude,
            Double longitude,
            LocalTime openingTime,
            LocalTime closingTime,
            ShopStatus status
    ) {
        List<Shop> ownerShops = shopRepository.findByOwner(owner);
        for (Shop s : ownerShops) {
            if (s.getShopName().equalsIgnoreCase(shopName)) {
                // Ensure active status and accurate hours
                boolean modified = false;
                if (s.getStatus() != status) {
                    s.setStatus(status);
                    modified = true;
                }
                if (!s.getOpeningTime().equals(openingTime) || !s.getClosingTime().equals(closingTime)) {
                    s.setOpeningTime(openingTime);
                    s.setClosingTime(closingTime);
                    modified = true;
                }
                if (modified) {
                    return shopRepository.save(s);
                }
                return s;
            }
        }

        Shop shop = Shop.builder()
                .owner(owner)
                .shopName(shopName)
                .description(description)
                .category(category)
                .phone(phone)
                .address(address)
                .city(city)
                .latitude(latitude)
                .longitude(longitude)
                .openingTime(openingTime)
                .closingTime(closingTime)
                .status(status)
                .validComplaintCount(0)
                .build();

        return shopRepository.save(shop);
    }

    private void seedProduct(
            Shop shop,
            String name,
            String description,
            BigDecimal price,
            Integer stockQuantity,
            ProductCategory category,
            String imageUrl
    ) {
        List<Product> existingProducts = productRepository.findByShopId(shop.getId());
        for (Product p : existingProducts) {
            if (p.getName().equalsIgnoreCase(name)) {
                // Ensure available, active, and stock is replenished
                boolean updated = false;
                if (!Boolean.TRUE.equals(p.getAvailable())) {
                    p.setAvailable(true);
                    updated = true;
                }
                if (p.getStockQuantity() == null || p.getStockQuantity() < 10) {
                    p.setStockQuantity(stockQuantity);
                    updated = true;
                }
                if (p.getPrice() == null || p.getPrice().compareTo(price) != 0) {
                    p.setPrice(price);
                    updated = true;
                }
                if (updated) {
                    productRepository.save(p);
                }
                return;
            }
        }

        Product product = Product.builder()
                .shop(shop)
                .name(name)
                .description(description)
                .price(price)
                .stockQuantity(stockQuantity)
                .category(category)
                .imageUrl(imageUrl)
                .available(true)
                .build();

        productRepository.save(product);
    }
}
