package com.ebank.service.impl;

import com.ebank.exception.SecurityLogException;
import com.ebank.model.securityLog.LogStatus;
import com.ebank.model.securityLog.SecurityLog;
import com.ebank.model.user.User;
import com.ebank.repository.SecurityLogRepository;
import com.ebank.repository.UserRepository;
import com.ebank.service.SecurityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityLogServiceImpl implements SecurityLogService {

    private final SecurityLogRepository securityLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SecurityLog logSecurityEvent(Long userId, String action,
                                        HttpServletRequest request, LogStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new SecurityLogException("User not found"));

        String ipAddress = getClientIpAddress(request);
        String deviceInfo = getDeviceInfo(request);

        SecurityLog securityLog = SecurityLog.builder()
                .user(user)
                .ipAddress(ipAddress)
                .action(action)
                .deviceInfo(deviceInfo)
                .timestamp(LocalDateTime.now())
                .status(status)
                .build();

        SecurityLog savedLog = securityLogRepository.save(securityLog);
        log.info("Logged security event: {} for user: {}", action, userId);
        return savedLog;
    }

    @Override
    public Page<SecurityLog> getUserSecurityLogs(Long userId, Pageable pageable) {
        return securityLogRepository.findByUser_IdOrderByTimestampDesc(userId, pageable);
    }

    @Override
    public List<SecurityLog> getRecentFailedAttempts(Long userId, int maxAttempts) {
        return securityLogRepository.findTopByUser_IdAndStatusOrderByTimestampDesc(
                userId, LogStatus.FAILED, Pageable.ofSize(maxAttempts));
    }

    @Override
    public boolean hasSuspiciousActivity(Long userId) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        int failedAttempts = securityLogRepository.countByUser_IdAndStatusAndTimestampAfter(
                userId, LogStatus.FAILED, cutoff);
        return failedAttempts >= 5;
    }

    @Override
    public List<SecurityLog> getLogsByIpAddress(String ipAddress) {
        return securityLogRepository.findByIpAddressOrderByTimestampDesc(ipAddress);
    }


    @Override
    public void deleteSecurityLog(Long logId) {
        SecurityLog securityLog = securityLogRepository.findById(logId)
                .orElseThrow(() -> new SecurityLogException("Security log not found"));

        securityLogRepository.delete(securityLog);
        log.info("Deleted security log with ID: {}", logId);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String getDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 255)) : "Unknown";
    }
}