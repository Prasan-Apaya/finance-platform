package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.finance.platform.entity.TransactionType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransactionRequest(
		@NotNull @Positive Long categoryId,
		@NotNull @Positive BigDecimal amount,
		@NotNull TransactionType type,
		@NotNull LocalDate date,
		String note) {
}
