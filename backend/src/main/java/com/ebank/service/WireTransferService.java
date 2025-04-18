package com.ebank.service;

import com.ebank.model.wireTransfer.TransferStatus;
import com.ebank.model.wireTransfer.WireTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface WireTransferService {
    WireTransfer initiateWireTransfer(Long senderAccountId, String recipientBankCode,
                                      String recipientAccountNumber, String recipientName,
                                      BigDecimal amount, String currency);

    WireTransfer completeTransfer(String referenceNumber);

    WireTransfer cancelTransfer(String referenceNumber);

    Page<WireTransfer> getTransfersByAccount(String accountNumber, Pageable pageable);

    List<WireTransfer> getPendingTransfers();

    WireTransfer getTransferByReference(String referenceNumber);

    List<WireTransfer> getTransfersByStatus(TransferStatus status);

}