package com.ebank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class CreditCardResponseDTO {
    private Long id;
    private String cardNumber;
    private String cardHolderName;
    private LocalDate expiryDate;
    private String cardType;
    private BigDecimal creditLimit;
    private BigDecimal availableBalance;
    private Long accountId;
    private Boolean isActive;
}
