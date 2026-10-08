package com.finance.platform.repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finance.platform.entity.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

	List<Budget> findAllByUser_IdAndMonthOrderByCategory_NameAsc(Long userId, YearMonth month);

	List<Budget> findAllByUser_IdOrderByMonthDescCategory_NameAsc(Long userId);

	Optional<Budget> findByIdAndUser_Id(Long id, Long userId);

	boolean existsByCategory_Id(Long categoryId);
}
