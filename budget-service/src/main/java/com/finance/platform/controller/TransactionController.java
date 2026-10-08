package com.finance.platform.controller;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

import com.finance.platform.dto.ImportResponse;
import com.finance.platform.dto.TransactionRequest;
import com.finance.platform.dto.TransactionResponse;
import com.finance.platform.service.FinanceService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

	private final FinanceService financeService;

	public TransactionController(FinanceService financeService) {
		this.financeService = financeService;
	}

	@GetMapping
	public List<TransactionResponse> getTransactions(@RequestParam @Positive Long userId,
			@RequestParam Optional<YearMonth> month) {
		return financeService.getTransactions(userId, month);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TransactionResponse createTransaction(@RequestParam @Positive Long userId,
			@Valid @RequestBody TransactionRequest request) {
		return financeService.createTransaction(userId, request);
	}

	@PutMapping("/{id}")
	public TransactionResponse updateTransaction(@RequestParam @Positive Long userId,
			@PathVariable @Positive Long id, @Valid @RequestBody TransactionRequest request) {
		return financeService.updateTransaction(userId, id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteTransaction(@RequestParam @Positive Long userId, @PathVariable @Positive Long id) {
		financeService.deleteTransaction(userId, id);
	}

	@PostMapping("/import")
	@ResponseStatus(HttpStatus.CREATED)
	public ImportResponse importTransactions(@RequestParam @Positive Long userId,
			@RequestPart("file") MultipartFile file) {
		return new ImportResponse(financeService.importTransactions(userId, file));
	}
}
