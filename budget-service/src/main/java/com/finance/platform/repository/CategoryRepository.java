package com.finance.platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.finance.platform.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	@Query("select c from Category c where c.user.id = :userId order by c.name asc")
	List<Category> findAllByUserIdOrderByNameAsc(@Param("userId") Long userId);

	@Query("select c from Category c where c.id = :id and c.user.id = :userId")
	Optional<Category> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

	@Query("select case when count(c) > 0 then true else false end from Category c "
			+ "where c.user.id = :userId and lower(c.name) = lower(:name)")
	boolean existsByUserIdAndNameIgnoreCase(
			@Param("userId") Long userId, @Param("name") String name);
}
