package com.finance.platform.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ForecastRequest(
        @JsonProperty("historical_data") List<HistoricalDataPoint> historicalData,
        @JsonProperty("periods") int periods,
        @JsonProperty("method") String method,
        @JsonProperty("confidence_level") double confidenceLevel,
        @JsonProperty("non_negative") boolean nonNegative) {
    public record HistoricalDataPoint(
            @JsonProperty("date") String date,
            @JsonProperty("amount") double amount,
            @JsonProperty("category") String category) {
    }

    public static ForecastRequest defaults(List<HistoricalDataPoint> historicalData) {
        return new ForecastRequest(
                historicalData,
                3, // default periods
                "auto", // default method
                0.95, // default confidence level
                true // default non_negative clamping
        );
    }
}
