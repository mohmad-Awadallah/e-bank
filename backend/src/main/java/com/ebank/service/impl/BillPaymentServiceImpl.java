package com.ebank.service.impl;

import com.ebank.exception.BillPaymentException;
import com.ebank.exception.InsufficientBalanceException;
import com.ebank.model.account.Account;
import com.ebank.model.account.AccountStatus;
import com.ebank.model.billPayment.BillPayment;
import com.ebank.repository.AccountRepository;
import com.ebank.repository.BillPaymentRepository;
import com.ebank.service.BillPaymentService;
import com.ebank.service.CacheService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillPaymentServiceImpl implements BillPaymentService {

    private final BillPaymentRepository billPaymentRepository;
    private final AccountRepository accountRepository;
    private final CacheService cacheService;

    @Override
    @Transactional
    public BillPayment processBillPayment(Long accountId, String billerCode,
                                          String customerReference, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BillPaymentException("Account not found"));

        validatePayment(account, amount);

        // Deduct amount from account
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // Create and save bill payment
        BillPayment payment = BillPayment.builder()
                .payerAccount(account)
                .billerCode(billerCode)
                .customerReference(customerReference)
                .amount(amount)
                .paymentDate(LocalDateTime.now())
                .paymentReceiptNumber(generateReceiptNumber())
                .build();

        BillPayment savedPayment = billPaymentRepository.save(payment);
        log.info("Processed bill payment with receipt: {}", savedPayment.getPaymentReceiptNumber());
        cacheService.cacheData("bill:receipt:" + savedPayment.getPaymentReceiptNumber(), savedPayment, BillPayment.class);
        cacheService.evictAccountCache("bill:history:" + accountId);
        return savedPayment;
    }

    @Override
    public List<BillPayment> getPaymentHistory(Long accountId) {
        String cacheKey = "bill:history:" + accountId;
        List<BillPayment> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<BillPayment> payments = billPaymentRepository.findByPayerAccount_IdOrderByPaymentDateDesc(accountId);
        cacheService.cacheData(cacheKey, payments, List.class);
        cacheService.setExpiration(cacheKey, 1, TimeUnit.HOURS);

        return payments;
    }

    @Override
    public BillPayment getPaymentByReceipt(String receiptNumber) {
        String cacheKey = "bill:receipt:" + receiptNumber;
        BillPayment cached = cacheService.getCachedData(cacheKey, BillPayment.class);

        if (cached != null) return cached;

        BillPayment payment = billPaymentRepository.findByPaymentReceiptNumber(receiptNumber)
                .orElseThrow(() -> new BillPaymentException("Payment not found"));
        cacheService.cacheData(cacheKey, payment, BillPayment.class);

        return payment;
    }

    @Override
    public List<BillPayment> getPaymentsByBiller(String billerCode) {
        String cacheKey = "bill:biller:" + billerCode;
        List<BillPayment> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<BillPayment> payments = billPaymentRepository.findByBillerCodeOrderByPaymentDateDesc(billerCode);
        cacheService.cacheData(cacheKey, payments, List.class);
        cacheService.setExpiration(cacheKey, 2, TimeUnit.HOURS);

        return payments;
    }

    private void validatePayment(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(account.getId(), amount);
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BillPaymentException("Account is not active");
        }
    }

    private String generateReceiptNumber() {
        return "RCPT-" + System.currentTimeMillis();
    }

    @Override
    public BillPayment getPaymentById(Long id) {
        String cacheKey = "bill:payment:" + id;
        BillPayment cached = cacheService.getCachedData(cacheKey, BillPayment.class);

        if (cached != null) return cached;

        BillPayment payment = billPaymentRepository.findById(id)
                .orElseThrow(() -> new BillPaymentException("Payment not found"));
        cacheService.cacheData(cacheKey, payment, BillPayment.class);

        return payment;
    }

    @Override
    @Transactional
    public void cancelPayment(Long id) {
        BillPayment payment = getPaymentById(id);
        cacheService.evictAccountCache("bill:receipt:" + payment.getPaymentReceiptNumber());
        cacheService.evictAccountCache("bill:history:" + payment.getPayerAccount().getId());
        if (payment.getPaymentDate().plusMinutes(15).isBefore(LocalDateTime.now())) {
            throw new BillPaymentException("Cannot cancel payment after 15 minutes");
        }
        Account account = payment.getPayerAccount();
        account.setBalance(account.getBalance().add(payment.getAmount()));
        accountRepository.save(account);

        billPaymentRepository.delete(payment);
    }
}