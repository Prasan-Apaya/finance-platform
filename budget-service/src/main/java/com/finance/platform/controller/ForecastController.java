package com.finance.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finance.platform.dto.ForecastResponse;
import com.finance.platform.dto.FrontendForecastRequest;
import com.finance.platform.service.ForecastService;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @PostMapping("/predict")
    public ResponseEntity<ForecastResponse> getForecast(@AuthenticationPrincipal Long id,
            @RequestBody FrontendForecastRequest frontEndRequest) {
        return forecastService.requestForecast(frontEndRequest);
    }
}
