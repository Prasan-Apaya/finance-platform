package com.finance.platform.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ForecastResponse(
        @JsonProperty("method_used") String methodUsed,
        @JsonProperty("periods_forecasted") int periodsForecasted,
        @JsonProperty("forecast") List<ForecastDataPoint> forecast,
        @JsonProperty("metrics") ForecastMetrics metrics,
        @JsonProperty("insights") List<String> insights) {
}
