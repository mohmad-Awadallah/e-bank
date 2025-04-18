package com.ebank.controller;

import com.ebank.dto.TransactionDTO;
import com.ebank.dto.TransactionRequest;
import com.ebank.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction Management", description = "APIs for managing financial transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(
            summary = "Transfer funds between accounts",
            description = "Initiate a new funds transfer between two accounts",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Transfer initiated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid transaction request"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping("/transfer")
    public ResponseEntity<TransactionDTO> transferFunds(@RequestBody TransactionRequest request) {
        TransactionDTO transaction = transactionService.transferFunds(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @Operation(
            summary = "Get transaction by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transaction details retrieved"),
                    @ApiResponse(responseCode = "404", description = "Transaction not found")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @Operation(
            summary = "Get account transaction history",
            description = "Paginated list of transactions for an account",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transactions retrieved")
            }
    )
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<Page<TransactionDTO>> getAccountTransactions(
            @PathVariable String accountNumber,
            Pageable pageable) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(accountNumber, pageable));
    }

    @Operation(
            summary = "Get recent transactions",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Recent transactions list")
            }
    )
    @GetMapping("/account/{accountNumber}/recent")
    public ResponseEntity<List<TransactionDTO>> getRecentTransactions(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(transactionService.getRecentTransactions(accountNumber, count));
    }

    @Operation(
            summary = "Reverse a transaction",
            description = "Reverse a completed transaction within 30 days",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transaction reversed successfully"),
                    @ApiResponse(responseCode = "400", description = "Reversal not allowed"),
                    @ApiResponse(responseCode = "404", description = "Transaction not found")
            }
    )
    @PostMapping("/{id}/reverse")
    public ResponseEntity<TransactionDTO> reverseTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.reverseTransaction(id));
    }

    @Operation(
            summary = "Search transactions by reference",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Matching transactions found")
            }
    )
    @GetMapping("/search")
    public ResponseEntity<List<TransactionDTO>> searchTransactions(
            @RequestParam String reference) {
        return ResponseEntity.ok(transactionService.searchByReference(reference));
    }
}