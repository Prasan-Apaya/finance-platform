package com.finance.platform.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.finance.platform.entity.Transaction;
import com.finance.platform.entity.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

	@Query("select t from Transaction t where t.user.id = :userId order by t.date desc, t.id desc")
	List<Transaction> findAllByUserIdOrderByDateDescIdDesc(@Param("userId") Long userId);

	@Query("select t from Transaction t where t.user.id = :userId "
			+ "and t.date between :startDate and :endDate order by t.date desc, t.id desc")
	List<Transaction> findAllByUserIdAndDateBetweenOrderByDateDescIdDesc(
			@Param("userId") Long userId, @Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate);

	@Query("select t from Transaction t where t.user.id = :userId "
			+ "and t.date between :startDate and :endDate and t.type = :type")
	List<Transaction> findAllByUserIdAndDateBetweenAndType(
			@Param("userId") Long userId, @Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate, @Param("type") TransactionType type);

	@Query("select t from Transaction t where t.id = :id and t.user.id = :userId")
	Optional<Transaction> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

	@Query("select case when count(t) > 0 then true else false end "
			+ "from Transaction t where t.category.id = :categoryId")
	boolean existsByCategoryId(@Param("categoryId") Long categoryId);
}
