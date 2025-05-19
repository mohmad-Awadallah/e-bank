package com.ebank.service.impl;

import com.ebank.dto.CreditCardResponseDTO;
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
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditCardServiceImpl implements CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final AccountRepository accountRepository;
    private final CacheService cacheService;

    @Override
    @Transactional
    public CreditCardResponseDTO issueCreditCard(Long accountId,
                                                 String cardHolderName,
                                                 CardType cardType,
                                                 BigDecimal creditLimit) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new CreditCardException("Account not found"));

        if (creditLimit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CreditCardException("Credit limit must be positive");
        }

        CreditCard card = CreditCard.builder()
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

        CreditCard saved = creditCardRepository.save(card);
        log.info("Issued new credit card: {} for account: {}", saved.getCardNumber(), accountId);

        cacheService.evictAccountCache("account:active-cards:" + accountId);

        return toDto(saved);
    }

    @Override
    @Transactional
    public CreditCardResponseDTO processPayment(Long cardId,
                                                BigDecimal amount) {
        CreditCard card = getActiveCreditCard(cardId);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CreditCardException("Amount must be positive");
        }
        if (card.getAvailableBalance().compareTo(amount) < 0) {
            throw new CreditCardException("Insufficient available credit");
        }

        card.setAvailableBalance(card.getAvailableBalance().subtract(amount));
        CreditCard updated = creditCardRepository.save(card);
        log.info("Processed payment of {} for card: {}", amount, cardId);

        evictCaches(updated);
        return toDto(updated);
    }

    @Override
    @Transactional
    public CreditCardResponseDTO updateCreditLimit(Long cardId,
                                                   BigDecimal newLimit) {
        CreditCard card = getActiveCreditCard(cardId);

        if (newLimit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CreditCardException("Credit limit must be positive");
        }

        BigDecimal diff = newLimit.subtract(card.getCreditLimit());
        card.setCreditLimit(newLimit);
        card.setAvailableBalance(card.getAvailableBalance().add(diff));
        CreditCard updated = creditCardRepository.save(card);
        log.info("Updated credit limit to {} for card: {}", newLimit, cardId);

        evictCaches(updated);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deactivateCard(Long cardId) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new CreditCardException("Card not found"));

        card.setIsActive(false);
        creditCardRepository.save(card);
        log.info("Deactivated credit card: {}", cardId);

        evictCaches(card);
    }

    @Override
    public CreditCardResponseDTO getCardDetails(Long cardId) {
        String key = "credit-card:details:" + cardId;
        CreditCardResponseDTO cached = cacheService.getCachedData(key, CreditCardResponseDTO.class);
        if (cached != null) return cached;

        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new CreditCardException("Card not found"));
        CreditCardResponseDTO dto = toDto(card);
        cacheService.cacheData(key, dto, CreditCardResponseDTO.class);
        cacheService.setExpiration(key, 1, TimeUnit.HOURS);
        return dto;
    }

    @Override
    public List<CreditCardResponseDTO> getCardsByAccount(Long accountId) {
        return creditCardRepository.findByLinkedAccount_Id(accountId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CreditCardResponseDTO> getActiveCardsByAccount(Long accountId) {
        String key = "account:active-cards:" + accountId;
        @SuppressWarnings("unchecked")
        List<CreditCardResponseDTO> cached = cacheService.getCachedData(key, List.class);
        if (cached != null) return cached;

        List<CreditCardResponseDTO> dtos = creditCardRepository
                .findByLinkedAccount_IdAndIsActiveTrue(accountId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        cacheService.cacheData(key, dtos, List.class);
        cacheService.setExpiration(key, 2, TimeUnit.HOURS);
        return dtos;
    }

    @Override
    @Transactional
    public CreditCardResponseDTO updateHolderName(Long cardId,
                                                  String newName) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new CreditCardException("Card not found"));
        card.setCardHolderName(newName);
        CreditCard updated = creditCardRepository.save(card);
        log.info("Updated holder name for card: {}", cardId);

        evictCaches(updated);
        return toDto(updated);
    }

    // —————— Helpers ——————

    private CreditCard getActiveCreditCard(Long cardId) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new CreditCardException("Card not found"));
        if (!card.getIsActive()) {
            throw new CreditCardException("Card is not active");
        }
        return card;
    }

    private void evictCaches(CreditCard card) {
        cacheService.evictAccountCache("credit-card:details:" + card.getId());
        cacheService.evictAccountCache("account:active-cards:" + card.getLinkedAccount().getId());
    }

    private CreditCardResponseDTO toDto(CreditCard c) {
        return CreditCardResponseDTO.builder()
                .id(c.getId())
                .cardNumber(c.getCardNumber())
                .cardHolderName(c.getCardHolderName())
                .expiryDate(c.getExpiryDate())
                .cardType(c.getCardType().name())
                .creditLimit(c.getCreditLimit())
                .availableBalance(c.getAvailableBalance())
                .accountId(c.getLinkedAccount().getId())
                .isActive(c.getIsActive())
                .build();
    }

    private String generateSecureCardNumber() {
        Random random = new Random();
        StringBuilder cardNumber = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            cardNumber.append(random.nextInt(10));
        }
        return cardNumber.substring(0, 4) + "-" +
                cardNumber.substring(4, 8) + "-" +
                cardNumber.substring(8, 12) + "-" +
                cardNumber.substring(12, 16);
    }


    private int generateRandomCVV() {
        return 100 + (int)(Math.random() * 900);
    }
}
