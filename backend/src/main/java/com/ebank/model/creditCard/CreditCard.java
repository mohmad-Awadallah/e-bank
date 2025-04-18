package com.ebank.model.creditCard;

import com.ebank.model.account.Account;
import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "credit_cards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String cardNumber; // Format: XXXX-XXXX-XXXX-XXXX (Encrypted)

    @NotBlank
    private String cardHolderName;

    @Future
    private LocalDate expiryDate;

    @Min(100)
    @Max(999)
    private Integer cvv; // Encrypted

    @Enumerated(EnumType.STRING)
    private CardType cardType;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account linkedAccount;

    @Builder.Default
    private Boolean isActive = true;

    private BigDecimal creditLimit;
    private BigDecimal availableBalance;
}