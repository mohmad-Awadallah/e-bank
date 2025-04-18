package com.ebank.service.impl;

import com.ebank.exception.DigitalWalletException;
import com.ebank.model.digitalWallet.DigitalWallet;
import com.ebank.model.digitalWallet.WalletType;
import com.ebank.model.user.User;
import com.ebank.repository.DigitalWalletRepository;
import com.ebank.repository.UserRepository;
import com.ebank.service.DigitalWalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DigitalWalletServiceImpl implements DigitalWalletService {

    private final DigitalWalletRepository digitalWalletRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DigitalWallet createWallet(Long userId, WalletType walletType, String phoneNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new DigitalWalletException("User not found"));

        validatePhoneNumber(phoneNumber);

        if (digitalWalletRepository.existsByOwner_IdAndWalletType(userId, walletType)) {
            throw new DigitalWalletException("User already has a wallet of this type");
        }

        DigitalWallet wallet = DigitalWallet.builder()
                .owner(user)
                .walletAddress(generateSecureWalletAddress())
                .walletType(walletType)
                .linkedPhoneNumber(phoneNumber)
                .isVerified(false)
                .build();

        DigitalWallet savedWallet = digitalWalletRepository.save(wallet);
        log.info("Created new {} wallet for user: {}", walletType, userId);
        return savedWallet;
    }

    @Override
    @Transactional
    public DigitalWallet verifyWallet(Long walletId, String verificationCode) {
        DigitalWallet wallet = getWalletById(walletId);

        // In production, implement proper verification logic
        if (!"123456".equals(verificationCode)) { // Example code
            throw new DigitalWalletException("Invalid verification code");
        }

        wallet.setIsVerified(true);
        DigitalWallet verifiedWallet = digitalWalletRepository.save(wallet);
        log.info("Verified wallet: {}", walletId);
        return verifiedWallet;
    }

    @Override
    @Transactional
    public void deleteWallet(Long walletId) {
        DigitalWallet wallet = getWalletById(walletId);
        digitalWalletRepository.delete(wallet);
        log.info("Deleted wallet: {}", walletId);
    }

    @Override
    public DigitalWallet getWalletById(Long walletId) {
        return digitalWalletRepository.findById(walletId)
                .orElseThrow(() -> new DigitalWalletException("Wallet not found"));
    }

    @Override
    public List<DigitalWallet> getUserWallets(Long userId) {
        return digitalWalletRepository.findByOwner_Id(userId);
    }

    @Override
    public DigitalWallet getWalletByAddress(String walletAddress) {
        return digitalWalletRepository.findByWalletAddress(walletAddress)
                .orElseThrow(() -> new DigitalWalletException("Wallet not found"));
    }

    @Override
    public boolean isWalletVerified(Long walletId) {
        return getWalletById(walletId).getIsVerified();
    }

    @Override
    public DigitalWallet updateWallet(DigitalWallet wallet) {
        DigitalWallet existingWallet = getWalletById(wallet.getId());
        existingWallet.setLinkedPhoneNumber(wallet.getLinkedPhoneNumber());
        return digitalWalletRepository.save(existingWallet);
    }

    private void validatePhoneNumber(String phoneNumber) {
        // Implement proper phone number validation
        if (phoneNumber == null || phoneNumber.length() < 10) {
            throw new DigitalWalletException("Invalid phone number");
        }
    }

    private String generateSecureWalletAddress() {
        return "WLT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();
    }
}