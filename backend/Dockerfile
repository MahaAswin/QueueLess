# Multi-stage Dockerfile for QueueLess Spring Boot Backend
# Compatible with Render Docker Web Service deployments

# 1. Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy project definition
COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw ./

# Make wrapper executable in Linux container
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy application source and build production artifact
COPY src ./src
RUN ./mvnw clean package -DskipTests

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S queueless && adduser -S queueless -G queueless

# Prepare upload directory
RUN mkdir -p /app/uploads/shops && chown -R queueless:queueless /app

USER queueless

# Copy built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
