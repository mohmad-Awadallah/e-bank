package com.ebank.exception;



public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String accountNumber) {
        super("Account not found with number: " + accountNumber);
    }
    public AccountNotFoundException(Long accountId) {
        super("Account not found with ID: " + accountId);
    }
}
