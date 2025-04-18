package com.ebank.repository;

import com.ebank.model.account.Account;
import com.ebank.model.account.AccountStatus;
import com.ebank.model.account.AccountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    // البحث الأساسي
    Optional<Account> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);

    // البحث بحساب المستخدم
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId")
    List<Account> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.status = :status")
    List<Account> findByUserIdAndStatus(@Param("userId") Long userId,
                                        @Param("status") AccountStatus status);

    // البحث الصفحي
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId")
    Page<Account> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // البحث بالنوع
    List<Account> findByAccountType(AccountType accountType);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.accountType = :accountType")
    List<Account> findByUserIdAndAccountType(@Param("userId") Long userId,
                                             @Param("accountType") AccountType accountType);

    // البحث بالرصيد
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.balance >= :minBalance")
    List<Account> findByUserIdWithMinBalance(@Param("userId") Long userId,
                                             @Param("minBalance") BigDecimal minBalance);

    // البحث بالحالة
    List<Account> findByStatus(AccountStatus status);

    // البحث المتقدم
    @Query("SELECT a FROM Account a WHERE " +
            "(:accountNumber IS NULL OR a.accountNumber LIKE %:accountNumber%) AND " +
            "(:accountType IS NULL OR a.accountType = :accountType) AND " +
            "(:minBalance IS NULL OR a.balance >= :minBalance) AND " +
            "(:maxBalance IS NULL OR a.balance <= :maxBalance)")
    List<Account> searchAccounts(@Param("accountNumber") String accountNumber,
                                 @Param("accountType") AccountType accountType,
                                 @Param("minBalance") BigDecimal minBalance,
                                 @Param("maxBalance") BigDecimal maxBalance);

    @Query("SELECT a FROM Account a WHERE " +
            "a.accountNumber LIKE %:searchTerm% OR " +
            "a.accountName LIKE %:searchTerm% OR " +
            "a.user.firstName LIKE %:searchTerm% OR " +
            "a.user.lastName LIKE %:searchTerm%")
    List<Account> search(@Param("searchTerm") String searchTerm);
}