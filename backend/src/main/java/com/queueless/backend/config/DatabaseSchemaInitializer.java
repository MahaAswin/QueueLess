package com.queueless.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Slf4j
@Component
@Order(1)
public class DatabaseSchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public DatabaseSchemaInitializer(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        try (Connection connection = dataSource.getConnection()) {
            String dbName = connection.getMetaData().getDatabaseProductName();
            log.info("Verifying database schema migration for: {}", dbName);

            if (dbName != null && dbName.toLowerCase().contains("postgresql")) {
                // Ensure valid_complaint_count exists with DEFAULT 0 and NOT NULL for existing users
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS valid_complaint_count INTEGER DEFAULT 0;");
                jdbcTemplate.execute("UPDATE users SET valid_complaint_count = 0 WHERE valid_complaint_count IS NULL;");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN valid_complaint_count SET DEFAULT 0;");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN valid_complaint_count SET NOT NULL;");
                log.info("PostgreSQL valid_complaint_count schema migration verified successfully.");
            } else if (dbName != null && dbName.toLowerCase().contains("h2")) {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS valid_complaint_count INT DEFAULT 0 NOT NULL;");
                jdbcTemplate.execute("UPDATE users SET valid_complaint_count = 0 WHERE valid_complaint_count IS NULL;");
                log.info("H2 valid_complaint_count schema verification verified successfully.");
            }
        } catch (Exception e) {
            log.warn("Database schema verification warning: {}", e.getMessage());
        }
    }
}
