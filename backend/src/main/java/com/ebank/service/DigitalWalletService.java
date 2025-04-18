package com.ebank.service;

import com.ebank.model.digitalWallet.DigitalWallet;
import com.ebank.model.digitalWallet.WalletType;

import java.util.List;

public interface DigitalWalletService {
    DigitalWallet createWallet(Long userId, WalletType walletType, String phoneNumber);

    DigitalWallet verifyWallet(Long walletId, String verificationCode);

    void deleteWallet(Long walletId);

    DigitalWallet getWalletById(Long walletId);

    List<DigitalWallet> getUserWallets(Long userId);

    DigitalWallet getWalletByAddress(String walletAddress);

    boolean isWalletVerified(Long walletId);

    DigitalWallet updateWallet(DigitalWallet wallet);
}