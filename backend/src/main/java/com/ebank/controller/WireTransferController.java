package com.ebank.controller;

import com.ebank.model.wireTransfer.TransferStatus;
import com.ebank.model.wireTransfer.WireTransfer;
import com.ebank.service.WireTransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/wire-transfers")
@RequiredArgsConstructor
@Tag(name = "Wire Transfer Management", description = "APIs for managing wire transfers")
public class WireTransferController {

    private final WireTransferService wireTransferService;

    @Operation(
            summary = "Initiate wire transfer",
            description = "Create a new wire transfer request",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Transfer initiated"),
                    @ApiResponse(responseCode = "400", description = "Invalid request"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping
    public ResponseEntity<WireTransfer> initiateTransfer(
            @RequestParam Long senderAccountId,
            @RequestParam String recipientBankCode,
            @RequestParam String recipientAccountNumber,
            @RequestParam String recipientName,
            @RequestParam BigDecimal amount,
            @RequestParam String currency
    ) {
        WireTransfer transfer = wireTransferService.initiateWireTransfer(
                senderAccountId,
                recipientBankCode,
                recipientAccountNumber,
                recipientName,
                amount,
                currency
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(transfer);
    }

    @Operation(
            summary = "Complete transfer",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transfer completed"),
                    @ApiResponse(responseCode = "400", description = "Transfer cannot be completed"),
                    @ApiResponse(responseCode = "404", description = "Transfer not found")
            }
    )
    @PatchMapping("/{referenceNumber}/complete")
    public ResponseEntity<WireTransfer> completeTransfer(
            @PathVariable String referenceNumber
    ) {
        return ResponseEntity.ok(wireTransferService.completeTransfer(referenceNumber));
    }

    @Operation(
            summary = "Cancel transfer",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transfer canceled"),
                    @ApiResponse(responseCode = "400", description = "Transfer cannot be canceled"),
                    @ApiResponse(responseCode = "404", description = "Transfer not found")
            }
    )
    @DeleteMapping("/{referenceNumber}")
    public ResponseEntity<Void> cancelTransfer(
            @PathVariable String referenceNumber
    ) {
        wireTransferService.cancelTransfer(referenceNumber);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get transfers by account",
            description = "Paginated list of transfers for an account",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transfers retrieved")
            }
    )
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<Page<WireTransfer>> getAccountTransfers(
            @PathVariable String accountNumber,
            Pageable pageable
    ) {
        return ResponseEntity.ok(wireTransferService.getTransfersByAccount(accountNumber, pageable));
    }

    @Operation(
            summary = "Get pending transfers",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Pending transfers list")
            }
    )
    @GetMapping("/pending")
    public ResponseEntity<List<WireTransfer>> getPendingTransfers() {
        return ResponseEntity.ok(wireTransferService.getPendingTransfers());
    }

    @Operation(
            summary = "Get transfer by reference",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transfer details"),
                    @ApiResponse(responseCode = "404", description = "Transfer not found")
            }
    )
    @GetMapping("/{referenceNumber}")
    public ResponseEntity<WireTransfer> getTransferByReference(
            @PathVariable String referenceNumber
    ) {
        return ResponseEntity.ok(wireTransferService.getTransferByReference(referenceNumber));
    }

    @Operation(
            summary = "Search transfers by status",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Filtered transfers list")
            }
    )
    @GetMapping("/status/{status}")
    public ResponseEntity<List<WireTransfer>> getTransfersByStatus(
            @PathVariable TransferStatus status
    ) {
        return ResponseEntity.ok(wireTransferService.getTransfersByStatus(status));
    }
}