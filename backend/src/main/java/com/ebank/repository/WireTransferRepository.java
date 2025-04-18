package com.ebank.repository;

import com.ebank.model.wireTransfer.TransferStatus;
import com.ebank.model.wireTransfer.WireTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WireTransferRepository extends JpaRepository<WireTransfer, Long> {
    Optional<WireTransfer> findByReferenceNumber(String referenceNumber);
    Page<WireTransfer> findBySenderAccount_AccountNumber(String accountNumber, Pageable pageable);
    List<WireTransfer> findByStatus(TransferStatus status);
}