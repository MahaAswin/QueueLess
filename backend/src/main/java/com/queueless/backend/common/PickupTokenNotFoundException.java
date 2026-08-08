package com.queueless.backend.common;

public class PickupTokenNotFoundException extends RuntimeException {
    public PickupTokenNotFoundException(String message) {
        super(message);
    }
}
