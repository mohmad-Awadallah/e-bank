package com.ebank.exception;

public class TransferExpiredException extends RuntimeException {
    public TransferExpiredException(String reference) {
        super("Transfer expired: " + reference);
    }
}