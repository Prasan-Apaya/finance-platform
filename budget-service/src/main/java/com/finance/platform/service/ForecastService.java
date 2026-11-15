package com.finance.platform.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.finance.platform.dto.ForecastRequest.HistoricalDataPoint;
import com.finance.platform.dto.ForecastResponse;
import com.finance.platform.dto.FrontendForecastRequest;
import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.repository.TransactionRepository;

@Service
public class ForecastService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public ForecastService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    public ResponseEntity<ForecastResponse> requestForecast(FrontendForecastRequest request) {
        List<HistoricalDataPoint> historicalData = transactionRepository
                .findTransactionHistoryByCategoryId(request.categoryId())
                .stream()
                .map(budget -> {
                    return new HistoricalDataPoint(
                            budget.getDate().toString(),
                            budget.getAmount().doubleValue(),
                            budget.getCategory().getName());
                }).toList();

        System.out.println("Historical Data: " + historicalData);
        return null;
    }

}
