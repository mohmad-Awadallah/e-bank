package com.ebank.dto;

import com.ebank.model.account.AccountStatus;
import com.ebank.model.account.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private String accountName;
    private String currency;
    private AccountStatus status;
}
