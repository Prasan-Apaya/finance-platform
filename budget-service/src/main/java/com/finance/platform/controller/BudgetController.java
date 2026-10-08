package com.finance.platform.controller;

import java.time.YearMonth;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.finance.platform.dto.BudgetRequest;
import com.finance.platform.dto.BudgetResponse;
import com.finance.platform.dto.BudgetStatusResponse;
import com.finance.platform.service.FinanceService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

	private final FinanceService financeService;

	public BudgetController(FinanceService financeService) {
		this.financeService = financeService;
	}

	@GetMapping
	public List<BudgetResponse> getBudgets(@RequestParam @Positive Long userId,
			@RequestParam(required = false) YearMonth month) {
		return financeService.getBudgets(userId, java.util.Optional.ofNullable(month));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public BudgetResponse createBudget(@RequestParam @Positive Long userId,
			@Valid @RequestBody BudgetRequest request) {
		return financeService.createBudget(userId, request);
	}

	@PutMapping("/{id}")
	public BudgetResponse updateBudget(@RequestParam @Positive Long userId,
			@PathVariable @Positive Long id, @Valid @RequestBody BudgetRequest request) {
		return financeService.updateBudget(userId, id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteBudget(@RequestParam @Positive Long userId, @PathVariable @Positive Long id) {
		financeService.deleteBudget(userId, id);
	}

	@GetMapping("/status")
	public BudgetStatusResponse getBudgetStatus(@RequestParam @Positive Long userId,
			@RequestParam YearMonth month) {
		return financeService.getBudgetStatus(userId, month);
	}

}
