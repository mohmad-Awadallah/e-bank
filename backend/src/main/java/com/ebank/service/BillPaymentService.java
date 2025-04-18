package com.ebank.service;

import com.ebank.model.billPayment.BillPayment;

import java.math.BigDecimal;
import java.util.List;

public interface BillPaymentService {
    BillPayment processBillPayment(Long accountId, String billerCode,
                                   String customerReference, BigDecimal amount);

    List<BillPayment> getPaymentHistory(Long accountId);

    BillPayment getPaymentByReceipt(String receiptNumber);

    List<BillPayment> getPaymentsByBiller(String billerCode);

    BillPayment getPaymentById(Long id);
    void cancelPayment(Long id);
}