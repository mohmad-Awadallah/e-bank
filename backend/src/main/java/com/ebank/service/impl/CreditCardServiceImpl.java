package com.ebank.service.impl;

import com.ebank.exception.CreditCardException;
import com.ebank.model.account.Account;
import com.ebank.model.creditCard.CardType;
import com.ebank.model.creditCard.CreditCard;
import com.ebank.repository.AccountRepository;
import com.ebank.repository.CreditCardRepository;
import com.ebank.service.CacheService;
import com.ebank.service.CreditCardService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditCardServiceImpl implements CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final AccountRepository accountRepository;
    private final CacheService cacheService;

    @Override
    @Transactional
    public CreditCard issueCreditCard(Long accountId, String cardHolderName,
                                      CardType cardType, BigDecimal creditLimit) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new CreditCardException("Account not found"));

        validateCreditCardRequest(account, creditLimit);

        CreditCard creditCard = CreditCard.builder()
                .cardNumber(generateSecureCardNumber())
                .cardHolderName(cardHolderName)
                .expiryDate(LocalDate.now().plusYears(3))
                .cvv(generateRandomCVV())
                .cardType(cardType)
                .linkedAccount(account)
                .isActive(true)
                .creditLimit(creditLimit)
                .availableBalance(creditLimit)
                .build();

        CreditCard savedCard = creditCardRepository.save(creditCard);
        log.info("Issued new credit card: {} for account: {}", savedCard.getCardNumber(), accountId);
        cacheService.evictAccountCache("account:active-cards:" + accountId);
        return savedCard;
    }

    @Override
    @Transactional
    public CreditCard processPayment(Long cardId, BigDecimal amount) {
        CreditCard creditCard = getActiveCreditCard(cardId);

        if (creditCard.getAvailableBalance().compareTo(amount) < 0) {
            throw new CreditCardException("Insufficient available credit");
        }

        creditCard.setAvailableBalance(creditCard.getAvailableBalance().subtract(amount));
        CreditCard updatedCard = creditCardRepository.save(creditCard);

        log.info("Processed payment of {} for card: {}", amount, cardId);
        return updatedCard;
    }

    @Override
    @Transactional
    public CreditCard updateCreditLimit(Long cardId, BigDecimal newLimit) {
        CreditCard creditCard = getActiveCreditCard(cardId);

        if (newLimit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CreditCardException("Credit limit must be positive");
        }

        BigDecimal difference = newLimit.subtract(creditCard.getCreditLimit());
        creditCard.setCreditLimit(newLimit);
        creditCard.setAvailableBalance(creditCard.getAvailableBalance().add(difference));

        CreditCard updatedCard = creditCardRepository.save(creditCard);
        log.info("Updated credit limit to {} for card: {}", newLimit, cardId);
        evictCardCache(updatedCard);
        return updatedCard;
    }

    @Override
    @Transactional
    public void deactivateCard(Long cardId) {
        CreditCard creditCard = getCreditCardById(cardId);
        creditCard.setIsActive(false);
        creditCardRepository.save(creditCard);
        log.info("Deactivated credit card: {}", cardId);
        evictCardCache(creditCard);
    }

    @Override
    public CreditCard getCardDetails(Long cardId) {
        String cacheKey = "credit-card:details:" + cardId;
        CreditCard cached = cacheService.getCachedData(cacheKey, CreditCard.class);

        if (cached != null) return cached;

        CreditCard card = getCreditCardById(cardId);
        cacheService.cacheData(cacheKey, card, CreditCard.class);
        cacheService.setExpiration(cacheKey, 1, TimeUnit.HOURS);
        return card;
    }

    @Override
    public List<CreditCard> getCardsByAccount(Long accountId) {
        return creditCardRepository.findByLinkedAccount_Id(accountId);
    }

    @Override
    public List<CreditCard> getActiveCardsByAccount(Long accountId) {
        String cacheKey = "account:active-cards:" + accountId;
        List<CreditCard> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<CreditCard> cards = creditCardRepository.findByLinkedAccount_IdAndIsActiveTrue(accountId);
        cacheService.cacheData(cacheKey, cards, List.class);
        cacheService.setExpiration(cacheKey, 2, TimeUnit.HOURS);

        return cards;
    }

    @Override
    public CreditCard updateCard(CreditCard creditCard) {
        CreditCard existingCard = getCreditCardById(creditCard.getId());
        existingCard.setCardHolderName(creditCard.getCardHolderName());

        return creditCardRepository.save(existingCard);
    }

    private CreditCard getCreditCardById(Long cardId) {
        return creditCardRepository.findById(cardId)
                .orElseThrow(() -> new CreditCardException("Credit card not found"));
    }

    private CreditCard getActiveCreditCard(Long cardId) {
        CreditCard creditCard = getCreditCardById(cardId);
        if (!creditCard.getIsActive()) {
            throw new CreditCardException("Credit card is not active");
        }
        return creditCard;
    }

    private void validateCreditCardRequest(Account account, BigDecimal creditLimit) {
        if (creditLimit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CreditCardException("Credit limit must be positive");
        }

        // Additional validation logic can be added here
    }

    private String generateSecureCardNumber() {
        String uuid = UUID.randomUUID().toString().replaceAll("-", "");
        return uuid.substring(0, 4) + "-"
                + uuid.substring(4, 8) + "-"
                + uuid.substring(8, 12) + "-"
                + uuid.substring(12, 16);
    }

    private int generateRandomCVV() {
        return 100 + (int) (Math.random() * 900);
    }

    private void evictCardCache(CreditCard card) {
        cacheService.evictAccountCache("credit-card:details:" + card.getId());
        cacheService.evictAccountCache("account:active-cards:" + card.getLinkedAccount().getId());
    }
}