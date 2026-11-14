package com.finance.platform.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.finance.platform.config.ForecastProperties;
import com.finance.platform.dto.ForecastRequest;
import com.finance.platform.dto.ForecastResponse;
import com.finance.platform.exceptions.ForecastUnavailableException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ForecastClient {

    private final RestClient forecastRestClient;
    private final ForecastProperties props;

    public ForecastResponse forecast(ForecastRequest request) {
        try {
            return forecastRestClient.post()
                    .uri("/forecast")
                    .header("X-Internal-Key", props.internalKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ForecastResponse.class);
        } catch (RestClientException e) {
            throw new ForecastUnavailableException("Forecast service unavailable", e);
        }
    }
}
