package com.finance.platform.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.finance.platform.exceptions.model.ErrorBody;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ForecastUnavailableException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ErrorBody forecastUnavailable(ForecastUnavailableException e) {
        return new ErrorBody(503, "Service Unavailable", "Forecast is temporarily unavailable");
    }
}
