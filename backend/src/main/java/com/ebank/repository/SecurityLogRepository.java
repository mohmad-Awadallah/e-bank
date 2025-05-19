package com.ebank.repository;

import com.ebank.model.securityLog.LogStatus;
import com.ebank.model.securityLog.SecurityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // هذا هو الاستيراد الصحيح
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {
    Page<SecurityLog> findByUser_IdOrderByTimestampDesc(Long userId, Pageable pageable);
    List<SecurityLog> findTopByUser_IdAndStatusOrderByTimestampDesc(
            Long userId, LogStatus status, Pageable pageable);
    int countByUser_IdAndStatusAndTimestampAfter(
            Long userId, LogStatus status, LocalDateTime timestamp);
    List<SecurityLog> findByIpAddressOrderByTimestampDesc(String ipAddress);
    long countByActionAndCreatedAtBetween(String action, LocalDateTime start, LocalDateTime end);

    long countByActionAndStatusAndCreatedAtBetween(
            String action,
            LogStatus status,
            LocalDateTime start,
            LocalDateTime end
    );
}