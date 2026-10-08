package com.finance.platform.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finance.platform.entity.Transaction;
import com.finance.platform.entity.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

	List<Transaction> findAllByUser_IdOrderByDateDescIdDesc(Long userId);

	List<Transaction> findAllByUser_IdAndDateBetweenOrderByDateDescIdDesc(
			Long userId, LocalDate startDate, LocalDate endDate);

	List<Transaction> findAllByUser_IdAndDateBetweenAndType(
			Long userId, LocalDate startDate, LocalDate endDate, TransactionType type);

	java.util.Optional<Transaction> findByIdAndUser_Id(Long id, Long userId);

	boolean existsByCategory_Id(Long categoryId);
}
