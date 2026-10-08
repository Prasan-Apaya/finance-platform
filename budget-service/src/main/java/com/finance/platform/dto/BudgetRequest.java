package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.YearMonth;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BudgetRequest(
		@NotNull @Positive Long categoryId,
		@NotNull YearMonth month,
		@NotNull @Positive BigDecimal limitAmount) {
}
