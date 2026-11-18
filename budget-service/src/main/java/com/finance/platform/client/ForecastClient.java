package com.finance.platform.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.reactive.function.client.WebClient;

import com.finance.platform.dto.ForecastRequest;
import com.finance.platform.dto.ForecastResponse;
import com.finance.platform.exceptions.ForecastUnavailableException;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class ForecastClient {

    private WebClient webClient;

    public Mono<ForecastResponse> forecast(ForecastRequest request) {
        try {
            return webClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ForecastResponse.class);
        } catch (RestClientException e) {
            throw new ForecastUnavailableException("Forecast service unavailable", e);
        }
    }
}
