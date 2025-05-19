package com.ebank.service;

import com.ebank.dto.BillPaymentResponseDTO;
import com.ebank.model.billPayment.BillPayment;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BillPaymentService {
    BillPaymentResponseDTO processBillPayment(Long accountId,
                                              String billerCode,
                                              String customerReference,
                                              BigDecimal amount);



    List<BillPaymentResponseDTO> getPaymentHistory(Long accountId);


    void cancelPayment(Long id);


    Optional<BillPaymentResponseDTO> getPaymentByReceipt(String receiptNumber);

    List<BillPaymentResponseDTO> getPaymentsByBiller(String billerCode);

    BillPaymentResponseDTO getPaymentDetailsById(Long id);


}