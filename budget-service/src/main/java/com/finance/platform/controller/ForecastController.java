package com.finance.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finance.platform.dto.ForecastRequest;
import com.finance.platform.dto.ForecastResponse;
import com.finance.platform.service.ForecastService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @PostMapping("/forecast")
    public Mono<ResponseEntity<ForecastResponse>> getForecast(@RequestBody ForecastRequest request) {
        return forecastService.requestForecast(request);
    }
}
