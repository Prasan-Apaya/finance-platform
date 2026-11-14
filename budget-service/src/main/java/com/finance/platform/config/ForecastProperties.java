package com.finance.platform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties(prefix = "forecast")
public record ForecastProperties(@NotBlank String baseUrl, @NotBlank String internalKey) {
}
