package com.ebank.repository;

import com.ebank.model.digitalWallet.DigitalWallet;
import com.ebank.model.digitalWallet.WalletType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DigitalWalletRepository extends JpaRepository<DigitalWallet, Long> {
    List<DigitalWallet> findByOwner_Id(Long userId);
    Optional<DigitalWallet> findByWalletAddress(String walletAddress);
    boolean existsByOwner_IdAndWalletType(Long userId, WalletType walletType);
}