package com.ebank.exception;

public class CurrencyMismatchException extends RuntimeException {
    public CurrencyMismatchException(String accountCurrency, String requestCurrency) {
        super("Currency mismatch. Account: " + accountCurrency + ", Request: " + requestCurrency);
    }
}