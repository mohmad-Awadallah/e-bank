package com.ebank.repository;

import com.ebank.model.transaction.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findBySourceAccount_AccountNumberOrTargetAccount_AccountNumber(
            String sourceAccountNumber,
            String targetAccountNumber,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.sourceAccount.accountNumber = :accountNumber " +
            "   OR t.targetAccount.accountNumber = :accountNumber " +
            "ORDER BY t.timestamp DESC")
    List<Transaction> findRecentTransactions(@Param("accountNumber") String accountNumber,
                                             Pageable pageable);

    List<Transaction> findByReferenceContainingIgnoreCase(String reference);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // البحث في حسابات متعددة باستخدام account numbers
    List<Transaction> findBySourceAccount_AccountNumberInOrTargetAccount_AccountNumberIn(
            List<String> sourceAccountNumbers,
            List<String> targetAccountNumbers
    );
}
