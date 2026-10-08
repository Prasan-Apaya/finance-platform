package com.finance.platform.dto;

import java.math.BigDecimal;

public record BudgetStatusItem(
		Long categoryId,
		String categoryName,
		BigDecimal limitAmount,
		BigDecimal spentAmount,
		BigDecimal remainingAmount,
		boolean overBudget) {
}
