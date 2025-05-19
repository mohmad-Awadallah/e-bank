package com.ebank.dto;

import com.ebank.model.wireTransfer.TransferStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WireTransferResponseDTO {
    private Long id;
    private String senderAccountNumber;
    private String recipientBankCode;
    private String recipientAccountNumber;
    private String recipientName;
    private BigDecimal amount;
    private String currency;
    private String referenceNumber;
    private TransferStatus status;
    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;
}