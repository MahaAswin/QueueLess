package com.queueless.backend.order;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    REJECTED,
    PREPARING,
    READY_FOR_PICKUP,
    COLLECTED,
    CANCELLED
}
