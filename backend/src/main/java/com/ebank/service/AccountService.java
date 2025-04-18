package com.ebank.service;

import com.ebank.dto.AccountDTO;
import com.ebank.dto.AccountDetailsDTO;
import com.ebank.dto.AccountCreationDTO;
import com.ebank.model.account.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {
    // العمليات الأساسية
    AccountDTO createAccount(AccountCreationDTO accountCreationDTO);
    AccountDetailsDTO getAccountDetails(Long accountId);
    Page<AccountDTO> getAllAccounts(Pageable pageable);
    List<AccountDTO> getUserAccounts(Long userId);

    // عمليات الرصيد
    BigDecimal getAccountBalance(Long accountId);
    void deposit(Long accountId, BigDecimal amount);
    void withdraw(Long accountId, BigDecimal amount);
    void transfer(Long sourceAccountId, Long targetAccountId, BigDecimal amount);

    // إدارة الحساب
    void deactivateAccount(Long accountId);
    void activateAccount(Long accountId);
    void updateAccountStatus(Long accountId, AccountStatus status);

    // عمليات البحث
    List<AccountDTO> searchAccounts(String searchTerm);
    List<AccountDTO> getAccountsByType(String accountType);

    // إعدادات الحساب
    void updateAccountDetails(Long accountId, AccountDTO accountDTO);
}