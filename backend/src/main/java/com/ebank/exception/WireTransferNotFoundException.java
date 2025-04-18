package com.ebank.exception;

public class WireTransferNotFoundException extends RuntimeException {
    public WireTransferNotFoundException(String reference) {
        super("Wire transfer not found with reference: " + reference);
    }
}