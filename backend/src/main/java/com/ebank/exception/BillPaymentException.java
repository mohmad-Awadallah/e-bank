package com.ebank.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BillPaymentException extends RuntimeException {
    public BillPaymentException(String message) {
        super(message);
    }
}