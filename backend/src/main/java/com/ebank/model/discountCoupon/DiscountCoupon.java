package com.ebank.model.discountCoupon;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "discount_coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCoupon {
    @Id
    @NotBlank
    private String couponCode;

    @NotBlank
    private String description;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private BigDecimal discountValue;

    @Future
    private LocalDate expiryDate;

    @Builder.Default
    private Integer usageLimit = 1;

    @Builder.Default
    private Integer usedCount = 0;

    private boolean active;
}
