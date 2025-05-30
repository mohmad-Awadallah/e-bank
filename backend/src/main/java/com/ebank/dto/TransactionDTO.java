package com.ebank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionDTO {
    private Long id;
    private BigDecimal amount;
    private String sourceAccountNumber;
    private String targetAccountNumber;
    private String currency;
    private LocalDateTime date;
    private String type;
    private String status;
    private String reference;
    private String description;
    private String accountNumber;
}
