package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.YearMonth;

public record BudgetResponse(
		Long id,
		Long userId,
		Long categoryId,
		String categoryName,
		YearMonth month,
		BigDecimal limitAmount) {
}
