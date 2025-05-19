package com.ebank.repository;

import com.ebank.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    long countByEnabled(boolean enabled);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}