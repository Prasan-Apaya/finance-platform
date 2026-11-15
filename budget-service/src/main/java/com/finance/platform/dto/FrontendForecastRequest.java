package com.finance.platform.dto;

public record FrontendForecastRequest(
                Long categoryId,
                int periods,
                String method,
                double confidenceLevel,
                boolean nonNegative) {
}
