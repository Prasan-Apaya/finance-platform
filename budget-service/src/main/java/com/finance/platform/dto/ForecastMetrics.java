package com.finance.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ForecastMetrics(
        @JsonProperty("mean_historical") double meanHistorical,
        @JsonProperty("trend") String trend,
        @JsonProperty("growth_rate_pct") double growthRatePct,
        @JsonProperty("volatility") double volatility,
        @JsonProperty("r_squared") Double rSquared) {
}
