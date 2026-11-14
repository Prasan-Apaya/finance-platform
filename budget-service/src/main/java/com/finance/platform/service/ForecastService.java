package com.finance.platform.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.finance.platform.dto.ForecastRequest;
import com.finance.platform.dto.ForecastResponse;

import reactor.core.publisher.Mono;

@Service
public class ForecastService {

    public Mono<ResponseEntity<ForecastResponse>> requestForecast(ForecastRequest request) {
        throw new UnsupportedOperationException("Unimplemented method 'requestForecast'");
    }

}
