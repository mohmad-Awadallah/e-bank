package com.ebank.service.impl;

import com.ebank.dto.BillPaymentCacheDTO;
import com.ebank.dto.BillPaymentResponseDTO;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillPaymentServiceImpl implements BillPaymentService {

    private final BillPaymentRepository billPaymentRepository;
    private final AccountRepository accountRepository;
    private final CacheService cacheService;

    @Override
    @Transactional
    public BillPaymentResponseDTO processBillPayment(Long accountId,
                                                     String billerCode,
                                                     String customerReference,
                                                     BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BillPaymentException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(accountId, amount);
        }
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BillPaymentException("Account is not active");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        BillPayment payment = BillPayment.builder()
                .payerAccount(account)
                .billerCode(billerCode)
                .customerReference(customerReference)
                .amount(amount)
                .paymentDate(LocalDateTime.now())
                .paymentReceiptNumber("RCPT-" + System.currentTimeMillis())
                .build();

        BillPayment saved = billPaymentRepository.save(payment);
        log.info("Processed bill payment with receipt: {}", saved.getPaymentReceiptNumber());

        // Cache lightweight DTO
        BillPaymentCacheDTO cacheDto = BillPaymentCacheDTO.builder()
                .receiptNumber(saved.getPaymentReceiptNumber())
                .payerAccountId(accountId)
                .amount(saved.getAmount())
                .paymentDate(saved.getPaymentDate())
                .build();
        cacheService.cacheData("bill:receipt:" + cacheDto.getReceiptNumber(),
                cacheDto,
                BillPaymentCacheDTO.class);
        cacheService.evictAccountCache("bill:history:" + accountId);

        // Return response DTO
        return BillPaymentResponseDTO.builder()
                .receiptNumber(saved.getPaymentReceiptNumber())
                .accountNumber(account.getAccountNumber())
                .amount(saved.getAmount())
                .paymentDate(saved.getPaymentDate())
                .build();
    }





    @Override
    public List<BillPaymentResponseDTO> getPaymentHistory(Long accountId) {
        List<BillPayment> payments = billPaymentRepository
                .findByPayerAccount_IdOrderByPaymentDateDesc(accountId);
        return payments.stream()
                .map(p -> BillPaymentResponseDTO.builder()
                        .id(p.getId())
                        .receiptNumber(p.getPaymentReceiptNumber())
                        .accountNumber(p.getPayerAccount().getAccountNumber())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .billerCode(p.getBillerCode())
                        .build())
                .collect(Collectors.toList());
    }



    @Override
    public Optional<BillPaymentResponseDTO> getPaymentByReceipt(String receiptNumber) {
        return billPaymentRepository.findByPaymentReceiptNumber(receiptNumber)
                .map(p -> BillPaymentResponseDTO.builder()
                        .receiptNumber(p.getPaymentReceiptNumber())
                        .accountNumber(p.getPayerAccount().getAccountNumber())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .build());
    }

    @Override
    public List<BillPaymentResponseDTO> getPaymentsByBiller(String billerCode) {
        List<BillPayment> payments = billPaymentRepository.findByBillerCodeOrderByPaymentDateDesc(billerCode);
        return payments.stream()
                .map(p -> BillPaymentResponseDTO.builder()
                        .receiptNumber(p.getPaymentReceiptNumber())
                        .accountNumber(p.getPayerAccount().getAccountNumber())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .billerCode(p.getBillerCode())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public BillPaymentResponseDTO getPaymentDetailsById(Long id) {
        BillPayment p = billPaymentRepository.findById(id)
                .orElseThrow(() -> new BillPaymentException("Payment not found"));
        return BillPaymentResponseDTO.builder()
                .id(p.getId())
                .receiptNumber(p.getPaymentReceiptNumber())
                .accountNumber(p.getPayerAccount().getAccountNumber())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .billerCode(p.getBillerCode())
                .build();
    }



    @Override
    @Transactional
    public void cancelPayment(Long id) {
        BillPayment p = billPaymentRepository.findById(id)
                .orElseThrow(() -> new BillPaymentException("Payment not found"));
        billPaymentRepository.delete(p);
    }

}
