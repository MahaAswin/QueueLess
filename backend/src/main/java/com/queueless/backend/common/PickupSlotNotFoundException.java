package com.queueless.backend.common;

public class PickupSlotNotFoundException extends RuntimeException {
    public PickupSlotNotFoundException(String message) {
        super(message);
    }
}
