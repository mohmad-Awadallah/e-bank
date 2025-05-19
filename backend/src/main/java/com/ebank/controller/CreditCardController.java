package com.ebank.controller;

import com.ebank.dto.CreditCardResponseDTO;
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

    @PostMapping
    public ResponseEntity<CreditCardResponseDTO> issueCard(
            @RequestParam Long accountId,
            @RequestParam String cardHolderName,
            @RequestParam CardType cardType,
            @RequestParam BigDecimal creditLimit
    ) {
        CreditCardResponseDTO dto = creditCardService.issueCreditCard(
                accountId, cardHolderName, cardType, creditLimit
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/{cardId}/payments")
    public ResponseEntity<CreditCardResponseDTO> processPayment(
            @PathVariable Long cardId,
            @RequestParam BigDecimal amount
    ) {
        return ResponseEntity.ok(creditCardService.processPayment(cardId, amount));
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<CreditCardResponseDTO> getCardDetails(@PathVariable Long cardId) {
        return ResponseEntity.ok(creditCardService.getCardDetails(cardId));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<CreditCardResponseDTO>> getAccountCards(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(creditCardService.getCardsByAccount(accountId));
    }

    @PutMapping("/{cardId}/credit-limit")
    public ResponseEntity<CreditCardResponseDTO> updateCreditLimit(
            @PathVariable Long cardId,
            @RequestParam BigDecimal newLimit
    ) {
        return ResponseEntity.ok(creditCardService.updateCreditLimit(cardId, newLimit));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deactivateCard(@PathVariable Long cardId) {
        creditCardService.deactivateCard(cardId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{cardId}/holder-name")
    public ResponseEntity<CreditCardResponseDTO> updateHolderName(
            @PathVariable Long cardId,
            @RequestParam String newName
    ) {
        CreditCardResponseDTO dto = creditCardService.updateHolderName(cardId, newName);
        return ResponseEntity.ok(dto);
    }
}
