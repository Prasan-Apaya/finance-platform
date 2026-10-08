package com.finance.platform.controller;

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

import com.finance.platform.dto.CategoryRequest;
import com.finance.platform.dto.CategoryResponse;
import com.finance.platform.service.FinanceService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

	private final FinanceService financeService;

	public CategoryController(FinanceService financeService) {
		this.financeService = financeService;
	}

	@GetMapping
	public List<CategoryResponse> getCategories(@RequestParam @Positive Long userId) {
		return financeService.getCategories(userId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public CategoryResponse createCategory(@RequestParam @Positive Long userId,
			@Valid @RequestBody CategoryRequest request) {
		return financeService.createCategory(userId, request);
	}

	@PutMapping("/{id}")
	public CategoryResponse updateCategory(@RequestParam @Positive Long userId,
			@PathVariable @Positive Long id, @Valid @RequestBody CategoryRequest request) {
		return financeService.updateCategory(userId, id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCategory(@RequestParam @Positive Long userId, @PathVariable @Positive Long id) {
		financeService.deleteCategory(userId, id);
	}
}
