package com.queueless.backend.slot;

public enum PickupSlotStatus {
    REQUESTED,
    ACCEPTED,
    COUNTER_PROPOSED,
    CUSTOMER_ACCEPTED,
    CUSTOMER_REJECTED,
    SHOP_REJECTED,
    EXPIRED,
    CANCELLED
}
