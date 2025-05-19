package com.ebank.controller;

import com.ebank.dto.BillPaymentResponseDTO;
import com.ebank.service.BillPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bill-payments")
@RequiredArgsConstructor
@Tag(name = "Bill Payment Management", description = "APIs for managing bill payments")
public class BillPaymentController {

    private final BillPaymentService billPaymentService;

    @Operation(summary = "Process new bill payment",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Payment processed"),
                    @ApiResponse(responseCode = "400", description = "Invalid or insufficient balance"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            })
    @PostMapping
    public ResponseEntity<BillPaymentResponseDTO> processPayment(
            @RequestParam Long accountId,
            @RequestParam String billerCode,
            @RequestParam String customerReference,
            @RequestParam BigDecimal amount
    ) {
        BillPaymentResponseDTO dto = billPaymentService.processBillPayment(
                accountId, billerCode, customerReference, amount
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @Operation(summary = "Get payment history for an account")
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<BillPaymentResponseDTO>> getHistory(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(billPaymentService.getPaymentHistory(accountId));
    }


    @Operation(summary = "Get payment by receipt number")
    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<BillPaymentResponseDTO> getByReceipt(
            @PathVariable String receiptNumber) {
        return billPaymentService.getPaymentByReceipt(receiptNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get all payments by biller code")
    @GetMapping("/biller/{billerCode}")
    public ResponseEntity<List<BillPaymentResponseDTO>> getByBiller(
            @PathVariable String billerCode) {
        return ResponseEntity.ok(billPaymentService.getPaymentsByBiller(billerCode));
    }

    @Operation(summary = "Get payment details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<BillPaymentResponseDTO> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(billPaymentService.getPaymentDetailsById(id));
    }


    @Operation(summary = "Cancel a pending payment by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id
    ) {
        billPaymentService.cancelPayment(id);
        return ResponseEntity.ok().build();
    }
}
