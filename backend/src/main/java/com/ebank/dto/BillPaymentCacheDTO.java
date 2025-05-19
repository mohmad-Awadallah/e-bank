package com.ebank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BillPaymentCacheDTO {
    private String receiptNumber;
    private Long payerAccountId;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
}