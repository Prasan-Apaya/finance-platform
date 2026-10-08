package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.finance.platform.entity.TransactionType;

public record TransactionResponse(
		Long id,
		Long userId,
		Long categoryId,
		BigDecimal amount,
		TransactionType type,
		LocalDate date,
		String note) {
}
