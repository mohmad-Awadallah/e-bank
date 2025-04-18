package com.ebank.exception;

public class IllegalTransferStateException extends RuntimeException {
    public IllegalTransferStateException(String message) {
        super(message);
    }
}