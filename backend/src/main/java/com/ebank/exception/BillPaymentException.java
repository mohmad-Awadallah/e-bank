package com.ebank.exception;

public class BillPaymentException extends RuntimeException {
    public BillPaymentException(String message) {
        super(message);
    }
}