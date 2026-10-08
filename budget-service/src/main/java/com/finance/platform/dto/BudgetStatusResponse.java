package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public record BudgetStatusResponse(
		Long userId,
		YearMonth month,
		BigDecimal totalLimit,
		BigDecimal totalSpent,
		BigDecimal totalRemaining,
		List<BudgetStatusItem> categories) {
}
