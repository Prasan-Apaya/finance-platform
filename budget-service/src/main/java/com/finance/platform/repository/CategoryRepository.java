package com.finance.platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finance.platform.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	List<Category> findAllByUser_IdOrderByNameAsc(Long userId);

	Optional<Category> findByIdAndUser_Id(Long id, Long userId);

	boolean existsByUser_IdAndNameIgnoreCase(Long userId, String name);
}
