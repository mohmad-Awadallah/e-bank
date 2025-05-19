package com.ebank.controller;

import com.ebank.dto.AccountCreationDTO;
import com.ebank.dto.AccountDTO;
import com.ebank.dto.AccountDetailsDTO;
import com.ebank.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "APIs for managing bank accounts")
public class AccountController {

    private final AccountService accountService;

    @Operation(
            summary = "Create new account",
            description = "Creates a new bank account for a user",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Account created successfully"),
                    @ApiResponse(responseCode = "404", description = "User not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            }
    )
    @PostMapping
    public ResponseEntity<AccountDTO> createAccount(@Valid @RequestBody AccountCreationDTO accountCreationDTO) {
        AccountDTO newAccount = accountService.createAccount(accountCreationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAccount);
    }

    @Operation(
            summary = "Get account details",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Account details retrieved"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<AccountDetailsDTO> getAccountDetails(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountDetails(id));
    }

    @Operation(summary = "Get all accounts (paginated)")
    @GetMapping
    public ResponseEntity<Page<AccountDTO>> getAllAccounts(Pageable pageable) {
        return ResponseEntity.ok(accountService.getAllAccounts(pageable));
    }

    @Operation(summary = "Get user accounts")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountDTO>> getUserAccounts(@PathVariable Long userId) {
        return ResponseEntity.ok(accountService.getUserAccounts(userId));
    }

    @Operation(summary = "Get account balance")
    @GetMapping("/{id}/balance")
    public ResponseEntity<BigDecimal> getAccountBalance(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountBalance(id));
    }

    @Operation(
            summary = "Deposit funds",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Deposit successful"),
                    @ApiResponse(responseCode = "400", description = "Invalid amount"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping("/{id}/deposit")
    public ResponseEntity<Void> deposit(
            @PathVariable Long id,
            @RequestParam @Positive(message = "Amount must be positive") BigDecimal amount
    ) {
        accountService.deposit(id, amount);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Withdraw funds",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Withdrawal successful"),
                    @ApiResponse(responseCode = "400", description = "Invalid amount or insufficient balance"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<Void> withdraw(
            @PathVariable Long id,
            @RequestParam @Positive(message = "Amount must be positive") BigDecimal amount
    ) {
        accountService.withdraw(id, amount);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Transfer funds between accounts",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transfer successful"),
                    @ApiResponse(responseCode = "400", description = "Invalid transfer details"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(
            @RequestParam Long sourceAccountId,
            @RequestParam Long targetAccountId,
            @RequestParam @Positive BigDecimal amount
    ) {
        accountService.transfer(sourceAccountId, targetAccountId, amount);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Activate account")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateAccount(@PathVariable Long id) {
        accountService.activateAccount(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Deactivate account")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateAccount(@PathVariable Long id) {
        accountService.deactivateAccount(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Search accounts")
    @GetMapping("/search")
    public ResponseEntity<List<AccountDTO>> searchAccounts(@RequestParam String query) {
        return ResponseEntity.ok(accountService.searchAccounts(query));
    }

    @Operation(summary = "Get accounts by type")
    @GetMapping("/type/{accountType}")
    public ResponseEntity<List<AccountDTO>> getAccountsByType(@PathVariable String accountType) {
        return ResponseEntity.ok(accountService.getAccountsByType(accountType));
    }

    @Operation(
            summary = "Update account details",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Details updated"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<AccountDTO> updateAccountDetails(
            @PathVariable Long id,
            @RequestBody AccountDTO accountDTO
    ) {
        accountService.updateAccountDetails(id, accountDTO);
        return ResponseEntity.ok(accountDTO);
    }

    @Operation(summary = "Get account by account number")
    @GetMapping("/by-number/{accountNumber}")
    public ResponseEntity<AccountDetailsDTO> getAccountByNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getAccountByNumber(accountNumber));
    }
}