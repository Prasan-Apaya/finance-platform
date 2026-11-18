package com.finance.platform.exception.model;

public record ApiError(
        int status,
        String error,
        String message) {
}
