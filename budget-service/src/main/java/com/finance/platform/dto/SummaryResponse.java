package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.YearMonth;

public record SummaryResponse(
		Long userId,
		YearMonth month,
		BigDecimal income,
		BigDecimal expenses,
		BigDecimal balance,
		long transactionCount) {
}
