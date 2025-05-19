package com.ebank.model.wireTransfer;

import com.ebank.model.account.Account;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wire_transfers")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class WireTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Account senderAccount;

    @NotBlank
    private String recipientBankCode;

    @NotBlank
    private String recipientAccountNumber;

    @NotBlank
    private String recipientName;

    @Positive
    private BigDecimal amount;

    @NotBlank
    private String currency;

    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    private TransferStatus status;

    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;
}
