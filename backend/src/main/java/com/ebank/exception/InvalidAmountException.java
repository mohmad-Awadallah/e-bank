package com.ebank.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.math.BigDecimal;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAmountException extends RuntimeException {

    public InvalidAmountException(String message) {
        super(message);
    }

    public InvalidAmountException(BigDecimal amount) {
        super("Invalid amount: " + amount.toString());
    }

    public InvalidAmountException(String message, Throwable cause) {
        super(message, cause);
    }
}