package com.ebank.controller;

import com.ebank.model.billPayment.BillPayment;
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

    @Operation(
            summary = "Process new bill payment",
            description = "Initiate a new bill payment transaction",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Payment processed successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input or insufficient balance"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping
    public ResponseEntity<BillPayment> processPayment(
            @RequestParam Long accountId,
            @RequestParam String billerCode,
            @RequestParam String customerReference,
            @RequestParam BigDecimal amount
    ) {
        BillPayment payment = billPaymentService.processBillPayment(
                accountId, billerCode, customerReference, amount
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @Operation(
            summary = "Get payment history",
            description = "Retrieve all payments for an account",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Payment history retrieved"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<BillPayment>> getPaymentHistory(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(billPaymentService.getPaymentHistory(accountId));
    }

    @Operation(
            summary = "Get payment by receipt number",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Payment details retrieved"),
                    @ApiResponse(responseCode = "404", description = "Payment not found")
            }
    )
    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<BillPayment> getPaymentByReceipt(
            @PathVariable String receiptNumber
    ) {
        return ResponseEntity.ok(billPaymentService.getPaymentByReceipt(receiptNumber));
    }

    @Operation(
            summary = "Get payments by biller",
            description = "List all payments for specific biller",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Payments list retrieved"),
                    @ApiResponse(responseCode = "404", description = "Biller not found")
            }
    )
    @GetMapping("/biller/{billerCode}")
    public ResponseEntity<List<BillPayment>> getPaymentsByBiller(
            @PathVariable String billerCode
    ) {
        return ResponseEntity.ok(billPaymentService.getPaymentsByBiller(billerCode));
    }

    @Operation(
            summary = "Get payment details by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Payment details retrieved"),
                    @ApiResponse(responseCode = "404", description = "Payment not found")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<BillPayment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(billPaymentService.getPaymentById(id));
    }

    @Operation(
            summary = "Cancel pending payment",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Payment cancelled"),
                    @ApiResponse(responseCode = "400", description = "Payment cannot be cancelled"),
                    @ApiResponse(responseCode = "404", description = "Payment not found")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelPayment(@PathVariable Long id) {
        billPaymentService.cancelPayment(id);
        return ResponseEntity.ok().build();
    }
}
