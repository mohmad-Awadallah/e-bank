package com.ebank.service.impl;

import com.ebank.dto.TransactionDTO;
import com.ebank.dto.TransactionRequest;
import com.ebank.exception.*;
import com.ebank.model.account.Account;
import com.ebank.model.account.AccountStatus;
import com.ebank.model.transaction.Transaction;
import com.ebank.model.transaction.TransactionStatus;
import com.ebank.model.transaction.TransactionType;
import com.ebank.repository.AccountRepository;
import com.ebank.repository.TransactionRepository;
import com.ebank.service.CacheService;
import com.ebank.service.TransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final ModelMapper modelMapper;
    private final CacheService cacheService;


    @Override
    @Transactional
    public TransactionDTO transferFunds(TransactionRequest request) {
        Account sourceAccount = accountRepository.findByAccountNumber(request.getFromAccount())
                .orElseThrow(() -> new AccountNotFoundException(request.getFromAccount()));

        Account targetAccount = accountRepository.findByAccountNumber(request.getToAccount())
                .orElseThrow(() -> new AccountNotFoundException(request.getToAccount()));

        validateTransfer(sourceAccount, targetAccount, request.getAmount());

        return executeTransfer(sourceAccount, targetAccount, request);
    }

    @Override
    public TransactionDTO getTransactionById(Long id) {
        String cacheKey = "transaction:" + id;
        TransactionDTO cached = cacheService.getCachedData(cacheKey, TransactionDTO.class);

        if (cached != null) return cached;

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException(id));
        TransactionDTO dto = convertToDto(transaction);

        cacheService.cacheData(cacheKey, dto, TransactionDTO.class);
        cacheService.setExpiration(cacheKey, 1, TimeUnit.HOURS);

        return dto;
    }

    @Override
    public Page<TransactionDTO> getAccountTransactions(String accountNumber, Pageable pageable) {
        String cacheKey = "account:transactions:" + accountNumber + ":" + pageable.getPageNumber();
        Page<TransactionDTO> cached = cacheService.getCachedData(cacheKey, Page.class);

        if (cached != null) return cached;

        Page<TransactionDTO> transactions = transactionRepository
                .findBySourceAccount_AccountNumberOrTargetAccount_AccountNumber(
                        accountNumber,
                        accountNumber,
                        pageable
                )
                .map(this::convertToDto);

        cacheService.cacheData(cacheKey, transactions, Page.class);
        cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);

        return transactions;
    }

    @Override
    public List<TransactionDTO> getRecentTransactions(String accountNumber, int count) {
        String cacheKey = "account:recent-txns:" + accountNumber;
        List<TransactionDTO> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<TransactionDTO> transactions = transactionRepository
                .findRecentTransactions(accountNumber, Pageable.ofSize(count))
                .stream()
                .map(this::convertToDto)
                .toList();

        cacheService.cacheData(cacheKey, transactions, List.class);
        cacheService.setExpiration(cacheKey, 15, TimeUnit.MINUTES);

        return transactions;
    }

    @Override
    @Transactional
    public TransactionDTO reverseTransaction(Long transactionId) {
        Transaction original = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));

        validateReversal(original);

        Transaction reversal = createReversalTransaction(original);
        Transaction savedReversal = transactionRepository.save(reversal);

        updateAccountBalancesForReversal(original, reversal);

        return convertToDto(savedReversal);
    }


    @Override
    public List<TransactionDTO> searchByReference(String reference) {
        return transactionRepository.findByReferenceContainingIgnoreCase(reference)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private TransactionDTO executeTransfer(Account source, Account target, TransactionRequest request) {
        // خصم المبلغ من الحساب المصدر
        source.setBalance(source.getBalance().subtract(request.getAmount()));
        accountRepository.save(source);

        // إضافة المبلغ للحساب الهدف
        target.setBalance(target.getBalance().add(request.getAmount()));
        accountRepository.save(target);

        // تسجيل المعاملة
        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .type(TransactionType.TRANSFER)
                .reference(generateReference())
                .sourceAccount(source)
                .targetAccount(target)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Processed transfer from {} to {} for amount {}",
                source.getAccountNumber(),
                target.getAccountNumber(),
                request.getAmount());

        return convertToDto(savedTransaction);
    }

    private void validateTransfer(Account source, Account target, BigDecimal amount) {
        if (source.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(Long.parseLong(source.getAccountNumber()), amount);
        }

        if (source.getStatus() != AccountStatus.ACTIVE || target.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("One or both accounts are not active");
        }

        if (source.getAccountNumber().equals(target.getAccountNumber())) {
            throw new InvalidTransactionException("Cannot transfer to same account");
        }
    }

    private void validateReversal(Transaction transaction) {
        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new InvalidTransactionException("Only completed transactions can be reversed");
        }

        if (transaction.getType() != TransactionType.TRANSFER) {
            throw new InvalidTransactionException("Only transfer transactions can be reversed");
        }

        if (transaction.getTimestamp().isBefore(LocalDateTime.now().minusDays(30))) {
            throw new InvalidTransactionException("Transactions older than 30 days cannot be reversed");
        }
    }

    private Transaction createReversalTransaction(Transaction original) {
        return Transaction.builder()
                .amount(original.getAmount())
                .type(TransactionType.REVERSAL)
                .reference("REV-" + original.getReference())
                .sourceAccount(original.getTargetAccount())
                .targetAccount(original.getSourceAccount())
                .status(TransactionStatus.COMPLETED)
                .description("Reversal of transaction #" + original.getId())
                .build();
    }

    private void updateAccountBalancesForReversal(Transaction original, Transaction reversal) {
        // استعادة الرصيد للحساب الأصلي
        Account originalSource = original.getSourceAccount();
        originalSource.setBalance(originalSource.getBalance().add(original.getAmount()));
        accountRepository.save(originalSource);

        // خصم الرصيد من الحساب الهدف
        Account originalTarget = original.getTargetAccount();
        originalTarget.setBalance(originalTarget.getBalance().subtract(original.getAmount()));
        accountRepository.save(originalTarget);
    }

    private String generateReference() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private TransactionDTO convertToDto(Transaction transaction) {
        TransactionDTO dto = modelMapper.map(transaction, TransactionDTO.class);
        dto.setSourceAccountNumber(transaction.getSourceAccount().getAccountNumber());
        if (transaction.getTargetAccount() != null) {
            dto.setTargetAccountNumber(transaction.getTargetAccount().getAccountNumber());
        }
        return dto;
    }


}