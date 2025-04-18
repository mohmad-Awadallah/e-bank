package com.ebank.controller;

import com.ebank.model.creditCard.CardType;
import com.ebank.model.creditCard.CreditCard;
import com.ebank.service.CreditCardService;
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
@RequestMapping("/api/credit-cards")
@RequiredArgsConstructor
@Tag(name = "Credit Card Management", description = "APIs for managing credit cards")
public class CreditCardController {

    private final CreditCardService creditCardService;

    @Operation(
            summary = "Issue new credit card",
            description = "Create a new credit card linked to an account",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Card issued successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
                    @ApiResponse(responseCode = "404", description = "Account not found")
            }
    )
    @PostMapping
    public ResponseEntity<CreditCard> issueCard(
            @RequestParam Long accountId,
            @RequestParam String cardHolderName,
            @RequestParam CardType cardType,
            @RequestParam BigDecimal creditLimit
    ) {
        CreditCard newCard = creditCardService.issueCreditCard(
                accountId, cardHolderName, cardType, creditLimit
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(newCard);
    }

    @Operation(
            summary = "Process credit card payment",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Payment processed successfully"),
                    @ApiResponse(responseCode = "400", description = "Insufficient credit/invalid amount"),
                    @ApiResponse(responseCode = "404", description = "Card not found")
            }
    )
    @PostMapping("/{cardId}/payments")
    public ResponseEntity<CreditCard> processPayment(
            @PathVariable Long cardId,
            @RequestParam BigDecimal amount
    ) {
        return ResponseEntity.ok(creditCardService.processPayment(cardId, amount));
    }

    @Operation(
            summary = "Update credit limit",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Limit updated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid limit value"),
                    @ApiResponse(responseCode = "404", description = "Card not found")
            }
    )
    @PutMapping("/{cardId}/credit-limit")
    public ResponseEntity<CreditCard> updateCreditLimit(
            @PathVariable Long cardId,
            @RequestParam BigDecimal newLimit
    ) {
        return ResponseEntity.ok(creditCardService.updateCreditLimit(cardId, newLimit));
    }

    @Operation(
            summary = "Deactivate credit card",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Card deactivated"),
                    @ApiResponse(responseCode = "404", description = "Card not found")
            }
    )
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deactivateCard(@PathVariable Long cardId) {
        creditCardService.deactivateCard(cardId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get card details by ID")
    @GetMapping("/{cardId}")
    public ResponseEntity<CreditCard> getCardDetails(@PathVariable Long cardId) {
        return ResponseEntity.ok(creditCardService.getCardDetails(cardId));
    }

    @Operation(summary = "Get all cards for account")
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<CreditCard>> getAccountCards(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(creditCardService.getCardsByAccount(accountId));
    }

    @Operation(summary = "Get active cards for account")
    @GetMapping("/account/{accountId}/active")
    public ResponseEntity<List<CreditCard>> getActiveAccountCards(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(creditCardService.getActiveCardsByAccount(accountId));
    }

    @Operation(
            summary = "Update card holder name",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Name updated"),
                    @ApiResponse(responseCode = "404", description = "Card not found")
            }
    )
    @PatchMapping("/{cardId}/holder-name")
    public ResponseEntity<CreditCard> updateHolderName(
            @PathVariable Long cardId,
            @RequestParam String newName
    ) {
        CreditCard card = creditCardService.getCardDetails(cardId);
        card.setCardHolderName(newName);
        return ResponseEntity.ok(creditCardService.updateCard(card));
    }
}