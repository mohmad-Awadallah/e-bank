package com.ebank.repository;

import com.ebank.model.billPayment.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    List<BillPayment> findByPayerAccount_IdOrderByPaymentDateDesc(Long accountId);
    Optional<BillPayment> findByPaymentReceiptNumber(String receiptNumber);
    List<BillPayment> findByBillerCodeOrderByPaymentDateDesc(String billerCode);
}