// CreditCardService.java
package com.ebank.service;

import com.ebank.dto.CreditCardResponseDTO;
import com.ebank.exception.CreditCardException;
import com.ebank.model.creditCard.CardType;

import java.math.BigDecimal;
import java.util.List;

public interface CreditCardService {

    CreditCardResponseDTO issueCreditCard(Long accountId,
                                          String cardHolderName,
                                          CardType cardType,
                                          BigDecimal creditLimit);

    CreditCardResponseDTO processPayment(Long cardId, BigDecimal amount);

    CreditCardResponseDTO updateCreditLimit(Long cardId, BigDecimal newLimit)
            throws CreditCardException;

    void deactivateCard(Long cardId);

    CreditCardResponseDTO getCardDetails(Long cardId);

    List<CreditCardResponseDTO> getCardsByAccount(Long accountId);

    List<CreditCardResponseDTO> getActiveCardsByAccount(Long accountId);

    CreditCardResponseDTO updateHolderName(Long cardId, String newName);
}
