package com.ebank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BillPaymentResponseDTO {
    private Long id;
    private String receiptNumber;
    private String accountNumber;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private String billerCode;
}
