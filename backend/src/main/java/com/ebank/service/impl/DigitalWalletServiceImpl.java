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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
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

        String verificationCode = generateVerificationCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        DigitalWallet wallet = DigitalWallet.builder()
                .owner(user)
                .walletAddress(generateSecureWalletAddress())
                .walletType(walletType)
                .linkedPhoneNumber(phoneNumber)
                .isVerified(false)
                .verificationCode(verificationCode)
                .verificationCodeExpiresAt(expiresAt)
                .build();

        DigitalWallet savedWallet = digitalWalletRepository.save(wallet);
        log.info("Created new {} wallet for user: {}, verification code: {}", walletType, userId, verificationCode);

        // يمكنك هنا إرسال كود التحقق عبر SMS أو بريد إلكتروني

        return savedWallet;
    }

    @Override
    @Transactional
    public DigitalWallet verifyWallet(Long walletId, String inputCode) {
        DigitalWallet wallet = getWalletById(walletId);

        if (wallet.getVerificationCode() == null || wallet.getVerificationCodeExpiresAt() == null) {
            throw new DigitalWalletException("Verification code not found");
        }

        if (wallet.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new DigitalWalletException("Verification code expired");
        }

        if (!wallet.getVerificationCode().equals(inputCode)) {
            throw new DigitalWalletException("Invalid verification code");
        }

        wallet.setIsVerified(true);
        wallet.setVerificationCode(null);
        wallet.setVerificationCodeExpiresAt(null);

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
                .orElseThrow(() -> new DigitalWalletException("Wallet not found for address: " + walletAddress));
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
        if (phoneNumber == null || phoneNumber.replaceAll("\\s+", "").length() < 10) {
            throw new DigitalWalletException("Invalid phone number");
        }
    }

    private String generateSecureWalletAddress() {
        return "WLT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Generates a 6-digit number
        return String.valueOf(code);
    }
}
