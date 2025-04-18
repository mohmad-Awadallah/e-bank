package com.ebank.model.billPayment;

import com.ebank.model.account.Account;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bill_payments")
@Data
@Builder
public class BillPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Account payerAccount;

    @NotBlank
    private String billerCode;

    @NotBlank
    private String customerReference;

    @Positive
    private BigDecimal amount;

    private LocalDateTime paymentDate;

    @Column(unique = true)
    private String paymentReceiptNumber;
}