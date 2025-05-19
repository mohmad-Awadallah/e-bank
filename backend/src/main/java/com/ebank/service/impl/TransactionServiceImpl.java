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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CacheService cacheService;

    // Generic caching helper
    private <T> T cached(String key, Class<T> clazz, Supplier<T> loader, long ttlMinutes) {
        T existing = cacheService.getCachedData(key, clazz);
        if (existing != null) return existing;
        T result = loader.get();
        cacheService.cacheData(key, result, clazz);
        cacheService.setExpiration(key, ttlMinutes, TimeUnit.MINUTES);
        return result;
    }

    @Override
    @Transactional
    public TransactionDTO transferFunds(TransactionRequest req) {
        Account src = accountRepository.findByAccountNumber(req.getFromAccount())
                .orElseThrow(() -> new AccountNotFoundException(req.getFromAccount()));
        Account tgt = accountRepository.findByAccountNumber(req.getToAccount())
                .orElseThrow(() -> new AccountNotFoundException(req.getToAccount()));

        if (src.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientBalanceException(Long.parseLong(src.getAccountNumber()), req.getAmount());
        }
        if (src.getStatus() != AccountStatus.ACTIVE || tgt.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("One or both accounts not active");
        }
        if (src.getAccountNumber().equals(tgt.getAccountNumber())) {
            throw new InvalidTransactionException("Cannot transfer to same account");
        }

        // adjust balances
        src.setBalance(src.getBalance().subtract(req.getAmount()));
        tgt.setBalance(tgt.getBalance().add(req.getAmount()));
        accountRepository.save(src);
        accountRepository.save(tgt);

        // record
        Transaction tx = Transaction.builder()
                .amount(req.getAmount())
                .type(req.getType())
                .status(TransactionStatus.COMPLETED)
                .reference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .timestamp(LocalDateTime.now())
                .sourceAccount(src)
                .targetAccount(tgt)
                .description(req.getDescription())
                .build();

        Transaction saved = transactionRepository.save(tx);
        log.info("Transfer {} → {} amount {}", src.getAccountNumber(), tgt.getAccountNumber(), req.getAmount());
        return toDto(saved);
    }

    @Override
    public TransactionDTO getTransactionById(Long id) {
        return cached(
                "txn:" + id, TransactionDTO.class,
                () -> transactionRepository.findById(id)
                        .map(this::toDto)
                        .orElseThrow(() -> new TransactionNotFoundException(id)),
                60
        );
    }

    @Override
    public Page<TransactionDTO> getAccountTransactions(String acctNum, Pageable pg) {
        return cached(
                "acc_txns:" + acctNum + ":" + pg.getPageNumber(), Page.class,
                () -> transactionRepository
                        .findBySourceAccount_AccountNumberOrTargetAccount_AccountNumber(acctNum, acctNum, pg)
                        .map(this::toDto),
                30
        );
    }

    @Override
    public List<TransactionDTO> getRecentTransactions(String acctNum, int count) {
        // تضمين count في مفتاح الكاش
        String cacheKey = "recent_txns:" + acctNum + ":" + count;
        return cached(
                cacheKey,
                List.class,
                () -> transactionRepository
                        // استخدام PageRequest.of للحصول على أول count معاملات مرتبة
                        .findRecentTransactions(acctNum, PageRequest.of(0, count))
                        .stream()
                        .map(this::toDto)
                        .toList(),
                15
        );
    }


    @Override
    @Transactional
    public TransactionDTO reverseTransaction(Long txnId) {
        Transaction orig = transactionRepository.findById(txnId)
                .orElseThrow(() -> new TransactionNotFoundException(txnId));
        if (orig.getStatus() != TransactionStatus.COMPLETED
                || orig.getType() != TransactionType.TRANSFER
                || orig.getTimestamp().isBefore(LocalDateTime.now().minusDays(30))) {
            throw new InvalidTransactionException("Cannot reverse transaction");
        }
        Account src = orig.getSourceAccount(), tgt = orig.getTargetAccount();
        // reverse
        Transaction rev = Transaction.builder()
                .amount(orig.getAmount())
                .type(TransactionType.REVERSAL)
                .status(TransactionStatus.COMPLETED)
                .reference("REV-" + orig.getReference())
                .timestamp(LocalDateTime.now())
                .sourceAccount(tgt)
                .targetAccount(src)
                .description("Reversal of #" + orig.getId())
                .build();
        Transaction savedRev = transactionRepository.save(rev);
        // restore balances
        src.setBalance(src.getBalance().add(orig.getAmount()));
        tgt.setBalance(tgt.getBalance().subtract(orig.getAmount()));
        accountRepository.save(src);
        accountRepository.save(tgt);
        return toDto(savedRev);
    }

    @Override
    public List<TransactionDTO> searchByReference(String ref) {
        return transactionRepository.findByReferenceContainingIgnoreCase(ref)
                .stream().map(this::toDto).toList();
    }

    @Override
    public List<TransactionDTO> getUserTransactions(Long userId) {
        var acctNums = accountRepository.findByUserId(userId)
                .stream().map(Account::getAccountNumber).toList();
        return transactionRepository
                .findBySourceAccount_AccountNumberInOrTargetAccount_AccountNumberIn(acctNums, acctNums)
                .stream().map(this::toDto)
                .distinct().toList();
    }

    // centralized mapper
    private TransactionDTO toDto(Transaction tx) {
        return TransactionDTO.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .sourceAccountNumber(tx.getSourceAccount().getAccountNumber())
                .targetAccountNumber(
                        tx.getTargetAccount() != null
                                ? tx.getTargetAccount().getAccountNumber()
                                : null
                )
                .accountNumber(tx.getSourceAccount().getAccountNumber())
                .currency(tx.getSourceAccount().getCurrency())
                .date(tx.getTimestamp())
                .type(tx.getType().name().toLowerCase())
                .status(tx.getStatus().name())
                .reference(tx.getReference())
                .description(tx.getDescription())
                .build();
    }
}
