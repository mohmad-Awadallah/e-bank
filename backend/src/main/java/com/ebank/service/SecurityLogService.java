package com.ebank.service;

import com.ebank.model.securityLog.LogStatus;
import com.ebank.model.securityLog.SecurityLog;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SecurityLogService {
    SecurityLog logSecurityEvent(Long userId, String action,
                                 HttpServletRequest request, LogStatus status);

    Page<SecurityLog> getUserSecurityLogs(Long userId, Pageable pageable);

    List<SecurityLog> getRecentFailedAttempts(Long userId, int maxAttempts);

    boolean hasSuspiciousActivity(Long userId);

    List<SecurityLog> getLogsByIpAddress(String ipAddress);

    void deleteSecurityLog(Long logId);

}