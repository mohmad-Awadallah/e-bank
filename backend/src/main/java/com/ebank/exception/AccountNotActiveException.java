package com.ebank.exception;

public class AccountNotActiveException extends RuntimeException {
    public AccountNotActiveException(String message) {
        super(message);
    }

    public AccountNotActiveException(Long accountId) {
        super("Account with ID " + accountId + " is not active");
    }
}
