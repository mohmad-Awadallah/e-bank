package com.ebank.model.digitalWallet;

import com.ebank.model.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "digital_wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @NotBlank
    private String walletAddress;

    @Enumerated(EnumType.STRING)
    private WalletType walletType;

    @NotBlank
    private String linkedPhoneNumber;

    private Boolean isVerified;

    private String verificationCode;

    private LocalDateTime verificationCodeExpiresAt;
}
