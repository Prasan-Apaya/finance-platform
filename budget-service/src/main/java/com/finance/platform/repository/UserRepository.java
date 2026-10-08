package com.finance.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finance.platform.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
