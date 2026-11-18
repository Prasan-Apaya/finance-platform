package com.finance.platform.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.finance.platform.client.ForecastClient;
import com.finance.platform.dto.ForecastRequest;
import com.finance.platform.dto.ForecastRequest.HistoricalDataPoint;
import com.finance.platform.dto.ForecastResponse;
import com.finance.platform.dto.FrontendForecastRequest;
import com.finance.platform.repository.TransactionRepository;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class ForecastService {

    private final TransactionRepository transactionRepository;
    private final ForecastClient forecastWebClient;

    public ForecastService(TransactionRepository transactionRepository,
            ForecastClient forecastWebClient) {
        this.transactionRepository = transactionRepository;
        this.forecastWebClient = forecastWebClient;
    }

    public Mono<ForecastResponse> requestForecast(FrontendForecastRequest request) {
        System.out.println("ForecastService - requestForecast called with request: " + request);
        return Mono.fromCallable(() -> {
            var historicalData = transactionRepository.findTransactionHistoryByCategoryId(request.categoryId());
            if (historicalData == null || historicalData.size() < 3) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Insufficient historical data. We need at least 3 months of records to generate a forecast.");
            }
            return historicalData.stream()
                    .map(tx -> new HistoricalDataPoint(
                            tx.getDate().toString(),
                            tx.getAmount().doubleValue(),
                            tx.getCategory().getName()))
                    .toList();
        })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(historicalDataPoints -> {
                    ForecastRequest payload = new ForecastRequest(
                            historicalDataPoints,
                            request.periods(),
                            request.method(),
                            request.confidenceLevel(),
                            request.nonNegative());

                    return forecastWebClient.forecast(payload);
                });
    }

}
