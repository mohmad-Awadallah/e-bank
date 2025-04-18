package com.ebank.model.securityLog;

import com.ebank.model.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_logs")
@Data
@Builder
public class SecurityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @NotBlank
    private String ipAddress;

    @NotBlank
    private String action;

    @NotBlank
    private String deviceInfo;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private LogStatus status;
}