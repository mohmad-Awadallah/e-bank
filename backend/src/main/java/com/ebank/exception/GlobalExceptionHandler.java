package com.ebank.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        return createProblemDetail(HttpStatus.NOT_FOUND, "Resource Not Found", ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
        logger.warn("Invalid credentials: {}", ex.getMessage());
        return createProblemDetail(HttpStatus.UNAUTHORIZED, "Authentication Failed", ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ProblemDetail handleDuplicateResource(DuplicateResourceException ex) {
        logger.warn("Duplicate resource detected: {}", ex.getMessage());
        return createProblemDetail(HttpStatus.CONFLICT, "Duplicate Resource", ex.getMessage());
    }

    @ExceptionHandler(InsufficientBalanceException.class)
    public ProblemDetail handleInsufficientBalance(InsufficientBalanceException ex) {
        logger.warn("Insufficient balance for bill payment: {}", ex.getMessage());
        return createProblemDetail(HttpStatus.BAD_REQUEST, "Insufficient Balance", ex.getMessage());
    }

    @ExceptionHandler(BillPaymentException.class)
    public ProblemDetail handleBillPaymentException(BillPaymentException ex) {
        logger.warn("Bill payment error: {}", ex.getMessage());
        return createProblemDetail(HttpStatus.BAD_REQUEST, "Bill Payment Error", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleAllExceptions(Exception ex) {
        logger.error("Unexpected error: ", ex);
        return createProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred");
    }

    private ProblemDetail createProblemDetail(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatus(status);
        problem.setTitle(title);
        problem.setDetail(detail);
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("documentation", "https://api.ebank.com/errors");
        return problem;
    }
}
