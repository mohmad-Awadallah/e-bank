package com.ebank.controller;

import com.ebank.model.securityLog.SecurityLog;
import com.ebank.service.SecurityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/security-logs")
@RequiredArgsConstructor
@Tag(name = "Security Log Management", description = "APIs for managing security logs")
public class SecurityLogController {

    private final SecurityLogService securityLogService;

    @Operation(
            summary = "Get user security logs",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Logs retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            }
    )
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<SecurityLog>> getUserSecurityLogs(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(securityLogService.getUserSecurityLogs(userId, pageable));
    }

    @Operation(
            summary = "Get recent failed attempts",
            description = "Get recent failed security attempts for user",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Logs retrieved"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            }
    )
    @GetMapping("/user/{userId}/failed-attempts")
    public ResponseEntity<List<SecurityLog>> getRecentFailedAttempts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int maxAttempts
    ) {
        return ResponseEntity.ok(securityLogService.getRecentFailedAttempts(userId, maxAttempts));
    }

    @Operation(
            summary = "Check suspicious activity",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Check completed"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            }
    )
    @GetMapping("/user/{userId}/suspicious-activity")
    public ResponseEntity<Boolean> hasSuspiciousActivity(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(securityLogService.hasSuspiciousActivity(userId));
    }

    @Operation(
            summary = "Get logs by IP address",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Logs retrieved"),
                    @ApiResponse(responseCode = "400", description = "Invalid IP format")
            }
    )
    @GetMapping("/ip/{ipAddress}")
    public ResponseEntity<List<SecurityLog>> getLogsByIpAddress(
            @PathVariable String ipAddress
    ) {
        return ResponseEntity.ok(securityLogService.getLogsByIpAddress(ipAddress));
    }

    @Operation(
            summary = "Delete security log (Admin only)",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Log deleted"),
                    @ApiResponse(responseCode = "403", description = "Forbidden"),
                    @ApiResponse(responseCode = "404", description = "Log not found")
            }
    )
    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteSecurityLog(
            @PathVariable Long logId
    ) {
        securityLogService.deleteSecurityLog(logId);
        return ResponseEntity.noContent().build();
    }
}