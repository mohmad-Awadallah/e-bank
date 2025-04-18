package com.ebank.model.digitalWallet;

import com.ebank.model.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "digital_wallets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User owner;

    @NotBlank
    private String walletAddress;

    @Enumerated(EnumType.STRING)
    private WalletType walletType;

    @NotBlank
    private String linkedPhoneNumber;

    @Builder.Default
    private Boolean isVerified = false;
}
