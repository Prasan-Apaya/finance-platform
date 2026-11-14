package com.finance.platform.exceptions;

public class ForecastUnavailableException extends RuntimeException {
    public ForecastUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
