package com.ebank.service.impl;

import com.ebank.exception.*;
import com.ebank.model.account.Account;
import com.ebank.model.account.AccountStatus;
import com.ebank.model.wireTransfer.TransferStatus;
import com.ebank.model.wireTransfer.WireTransfer;
import com.ebank.repository.AccountRepository;
import com.ebank.repository.WireTransferRepository;
import com.ebank.service.WireTransferService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WireTransferServiceImpl implements WireTransferService {
    private final WireTransferRepository wireTransferRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public WireTransfer initiateWireTransfer(Long senderAccountId, String recipientBankCode,
                                             String recipientAccountNumber, String recipientName,
                                             BigDecimal amount, String currency) {
        Account senderAccount = accountRepository.findById(senderAccountId)
                .orElseThrow(() -> new AccountNotFoundException(senderAccountId));

        validateTransfer(senderAccount, amount, currency);

        WireTransfer transfer = WireTransfer.builder()
                .senderAccount(senderAccount)
                .recipientBankCode(recipientBankCode)
                .recipientAccountNumber(recipientAccountNumber)
                .recipientName(recipientName)
                .amount(amount)
                .currency(currency)
                .referenceNumber(generateReferenceNumber())
                .status(TransferStatus.PENDING)
                .initiatedAt(LocalDateTime.now())
                .build();

        WireTransfer savedTransfer = wireTransferRepository.save(transfer);
        log.info("Initiated wire transfer with reference: {}", savedTransfer.getReferenceNumber());
        return savedTransfer;
    }

    @Override
    @Transactional
    public WireTransfer completeTransfer(String referenceNumber) {
        WireTransfer transfer = wireTransferRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new WireTransferNotFoundException(referenceNumber));

        validateTransferCompletion(transfer);

        // خصم المبلغ من الحساب المرسل
        Account senderAccount = transfer.getSenderAccount();
        senderAccount.setBalance(senderAccount.getBalance().subtract(transfer.getAmount()));
        accountRepository.save(senderAccount);

        transfer.setStatus(TransferStatus.COMPLETED);
        transfer.setCompletedAt(LocalDateTime.now());

        WireTransfer updatedTransfer = wireTransferRepository.save(transfer);
        log.info("Completed wire transfer: {}", referenceNumber);
        return updatedTransfer;
    }

    @Override
    @Transactional
    public WireTransfer cancelTransfer(String referenceNumber) {
        WireTransfer transfer = wireTransferRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new WireTransferNotFoundException(referenceNumber));

        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new IllegalTransferStateException("Only pending transfers can be canceled");
        }

        transfer.setStatus(TransferStatus.CANCELED);
        WireTransfer updatedTransfer = wireTransferRepository.save(transfer);
        log.info("Canceled wire transfer: {}", referenceNumber);
        return updatedTransfer;
    }

    @Override
    public Page<WireTransfer> getTransfersByAccount(String accountNumber, Pageable pageable) {
        return wireTransferRepository.findBySenderAccount_AccountNumber(accountNumber, pageable);
    }

    @Override
    public List<WireTransfer> getPendingTransfers() {
        return wireTransferRepository.findByStatus(TransferStatus.PENDING);
    }

    @Override
    public WireTransfer getTransferByReference(String referenceNumber) {
        return wireTransferRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new WireTransferNotFoundException(referenceNumber));
    }


    @Override
    public List<WireTransfer> getTransfersByStatus(TransferStatus status) {
        return wireTransferRepository.findByStatus(status);
    }

    private void validateTransfer(Account senderAccount, BigDecimal amount, String currency) {
        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(senderAccount.getId(), amount);
        }

        if (senderAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(senderAccount.getId());
        }

        if (!senderAccount.getCurrency().equalsIgnoreCase(currency)) {
            throw new CurrencyMismatchException(senderAccount.getCurrency(), currency);
        }
    }

    private void validateTransferCompletion(WireTransfer transfer) {
        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new IllegalTransferStateException("Transfer is not in pending state");
        }

        if (transfer.getInitiatedAt().isBefore(LocalDateTime.now().minusDays(1))) {
            throw new TransferExpiredException(transfer.getReferenceNumber());
        }
    }

    private String generateReferenceNumber() {
        return "WT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}