package com.ebank.controller;

import com.ebank.model.digitalWallet.DigitalWallet;
import com.ebank.model.digitalWallet.WalletType;
import com.ebank.service.DigitalWalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/digital-wallets")
@RequiredArgsConstructor
@Tag(name = "Digital Wallet Management", description = "APIs for managing digital wallets")
public class DigitalWalletController {

    private final DigitalWalletService digitalWalletService;

    @Operation(
            summary = "Create new digital wallet",
            description = "Register a new digital wallet for user",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Wallet created successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            }
    )
    @PostMapping
    public ResponseEntity<DigitalWallet> createWallet(
            @RequestParam Long userId,
            @RequestParam WalletType walletType,
            @RequestParam String phoneNumber
    ) {
        DigitalWallet newWallet = digitalWalletService.createWallet(userId, walletType, phoneNumber);
        return ResponseEntity.status(HttpStatus.CREATED).body(newWallet);
    }

    @Operation(
            summary = "Verify wallet",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Wallet verified"),
                    @ApiResponse(responseCode = "400", description = "Invalid verification code"),
                    @ApiResponse(responseCode = "404", description = "Wallet not found")
            }
    )
    @PatchMapping("/{walletId}/verify")
    public ResponseEntity<DigitalWallet> verifyWallet(
            @PathVariable Long walletId,
            @RequestParam String verificationCode
    ) {
        return ResponseEntity.ok(digitalWalletService.verifyWallet(walletId, verificationCode));
    }

    @Operation(
            summary = "Delete wallet",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Wallet deleted"),
                    @ApiResponse(responseCode = "404", description = "Wallet not found")
            }
    )
    @DeleteMapping("/{walletId}")
    public ResponseEntity<Void> deleteWallet(@PathVariable Long walletId) {
        digitalWalletService.deleteWallet(walletId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get wallet by ID")
    @GetMapping("/{walletId}")
    public ResponseEntity<DigitalWallet> getWalletById(@PathVariable Long walletId) {
        return ResponseEntity.ok(digitalWalletService.getWalletById(walletId));
    }

    @Operation(summary = "Get user wallets")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DigitalWallet>> getUserWallets(@PathVariable Long userId) {
        return ResponseEntity.ok(digitalWalletService.getUserWallets(userId));
    }

    @Operation(summary = "Check wallet verification status")
    @GetMapping("/{walletId}/verification-status")
    public ResponseEntity<Boolean> checkVerificationStatus(@PathVariable Long walletId) {
        return ResponseEntity.ok(digitalWalletService.isWalletVerified(walletId));
    }

    @Operation(summary = "Get wallet by address")
    @GetMapping("/address/{walletAddress}")
    public ResponseEntity<DigitalWallet> getWalletByAddress(@PathVariable String walletAddress) {
        return ResponseEntity.ok(digitalWalletService.getWalletByAddress(walletAddress));
    }

    @Operation(
            summary = "Update linked phone number",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Phone number updated"),
                    @ApiResponse(responseCode = "400", description = "Invalid phone number"),
                    @ApiResponse(responseCode = "404", description = "Wallet not found")
            }
    )
    @PatchMapping("/{walletId}/phone-number")
    public ResponseEntity<DigitalWallet> updatePhoneNumber(
            @PathVariable Long walletId,
            @RequestParam String newPhoneNumber
    ) {
        DigitalWallet wallet = digitalWalletService.getWalletById(walletId);
        wallet.setLinkedPhoneNumber(newPhoneNumber);
        return ResponseEntity.ok(digitalWalletService.updateWallet(wallet));
    }
}