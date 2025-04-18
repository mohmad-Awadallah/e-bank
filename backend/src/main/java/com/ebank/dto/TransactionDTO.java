package com.ebank.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Long id;
    private BigDecimal amount;
    private String sourceAccountNumber;
    private String targetAccountNumber;
    private LocalDateTime timestamp;
    private String type;
    private String status;
    private String reference;
    private String description;
}