package com.ebank.service;

import com.ebank.dto.WireTransferResponseDTO;
import com.ebank.model.wireTransfer.TransferStatus;
import com.ebank.model.wireTransfer.WireTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface WireTransferService {
    WireTransferResponseDTO initiateWireTransfer(Long senderAccountId, String recipientBankCode,
                                                 String recipientAccountNumber, String recipientName,
                                                 BigDecimal amount, String currency);

    WireTransferResponseDTO completeTransfer(String referenceNumber);


    Page<WireTransferResponseDTO> getTransfersByAccount(String accountNumber, Pageable pageable);

    List<WireTransferResponseDTO> getPendingTransfers();

    WireTransferResponseDTO getTransferByReference(String referenceNumber);

    List<WireTransferResponseDTO> getTransfersByStatus(TransferStatus status);

    WireTransferResponseDTO cancelTransfer(String referenceNumber);

}