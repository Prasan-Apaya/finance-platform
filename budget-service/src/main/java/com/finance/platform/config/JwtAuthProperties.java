package com.finance.platform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@ConfigurationProperties(prefix = "jwt.auth")
public record JwtAuthProperties(
                @NotBlank @Size(min = 32) String secretKey,
                @Positive long expirationMs,
                @NotBlank String issuer) {
}