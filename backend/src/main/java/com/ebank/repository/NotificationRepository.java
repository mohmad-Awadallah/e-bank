package com.ebank.repository;

import com.ebank.model.notification.Notification;
import com.ebank.model.notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification> findByRecipient_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRecipient_IdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);
    int countByRecipient_IdAndIsReadFalse(Long userId);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}