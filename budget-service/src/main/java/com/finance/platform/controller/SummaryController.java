package com.finance.platform.controller;

import java.time.YearMonth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finance.platform.dto.SummaryResponse;
import com.finance.platform.service.FinanceService;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

	private final FinanceService financeService;

	public SummaryController(FinanceService financeService) {
		this.financeService = financeService;
	}

	@GetMapping
	public SummaryResponse getSummary(@RequestParam @Positive Long userId,
			@RequestParam YearMonth month) {
		return financeService.getSummary(userId, month);
	}
}
