package com.ebank.service;

import com.ebank.model.creditCard.CardType;
import com.ebank.model.creditCard.CreditCard;

import java.math.BigDecimal;
import java.util.List;

public interface CreditCardService {
    CreditCard issueCreditCard(Long accountId, String cardHolderName,
                               CardType cardType, BigDecimal creditLimit);

    CreditCard processPayment(Long cardId, BigDecimal amount);

    CreditCard updateCreditLimit(Long cardId, BigDecimal newLimit);

    void deactivateCard(Long cardId);

    CreditCard getCardDetails(Long cardId);

    List<CreditCard> getCardsByAccount(Long accountId);

    List<CreditCard> getActiveCardsByAccount(Long accountId);

    CreditCard updateCard(CreditCard creditCard);

}