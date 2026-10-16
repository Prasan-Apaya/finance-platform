package com.finance.platform.repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.finance.platform.entity.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

	@Query("select b from Budget b where b.user.id = :userId and b.month = :month "
			+ "order by b.category.name asc")
	List<Budget> findAllByUserIdAndMonthOrderByCategoryNameAsc(
			@Param("userId") Long userId, @Param("month") YearMonth month);

	@Query("select b from Budget b where b.user.id = :userId "
			+ "order by b.month desc, b.category.name asc")
	List<Budget> findAllByUserIdOrderByMonthDescCategoryNameAsc(@Param("userId") Long userId);

	@Query("select b from Budget b where b.id = :id and b.user.id = :userId")
	Optional<Budget> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

	@Query("select case when count(b) > 0 then true else false end "
			+ "from Budget b where b.category.id = :categoryId")
	boolean existsByCategoryId(@Param("categoryId") Long categoryId);
}
