package com.finance.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ForecastDataPoint(
        @JsonProperty("period_index") int periodIndex,
        @JsonProperty("date") String date,
        @JsonProperty("predicted_amount") double predictedAmount,
        @JsonProperty("lower_bound") double lowerBound,
        @JsonProperty("upper_bound") double upperBound) {
}