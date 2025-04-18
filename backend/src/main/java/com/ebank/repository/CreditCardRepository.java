package com.ebank.repository;

import com.ebank.model.creditCard.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    List<CreditCard> findByLinkedAccount_Id(Long accountId);
    List<CreditCard> findByLinkedAccount_IdAndIsActiveTrue(Long accountId);
    Optional<CreditCard> findByCardNumber(String cardNumber);
}