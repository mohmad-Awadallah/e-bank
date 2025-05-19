package com.ebank.service;

import com.ebank.dto.TransactionDTO;
import com.ebank.dto.TransactionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TransactionService {
    public TransactionDTO transferFunds(TransactionRequest request);
    public TransactionDTO getTransactionById(Long id);
    public Page<TransactionDTO> getAccountTransactions(String accountNumber, Pageable pageable);
    public List<TransactionDTO> getRecentTransactions(String accountNumber, int count);
    public TransactionDTO reverseTransaction(Long transactionId);
    List<TransactionDTO> searchByReference(String reference);
    List<TransactionDTO> getUserTransactions(Long userId);

}
