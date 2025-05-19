package com.ebank.service.impl;

import com.ebank.exception.DiscountCouponException;
import com.ebank.model.discountCoupon.DiscountCoupon;
import com.ebank.model.discountCoupon.DiscountType;
import com.ebank.repository.DiscountCouponRepository;
import com.ebank.service.DiscountCouponService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiscountCouponServiceImpl implements DiscountCouponService {

    private final DiscountCouponRepository discountCouponRepository;

    @Override
    @Transactional
    public DiscountCoupon createCoupon(String couponCode, String description,
                                       DiscountType discountType, BigDecimal discountValue,
                                       LocalDate expiryDate, Integer usageLimit) {

        validateCouponParameters(discountType, discountValue, expiryDate, usageLimit);

        if (discountCouponRepository.existsById(couponCode)) {
            throw new DiscountCouponException("Coupon code already exists");
        }

        DiscountCoupon coupon = DiscountCoupon.builder()
                .couponCode(couponCode)
                .description(description)
                .discountType(discountType)
                .discountValue(discountValue)
                .expiryDate(expiryDate)
                .usageLimit(usageLimit)
                .usedCount(0)
                .build();

        DiscountCoupon savedCoupon = discountCouponRepository.save(coupon);
        log.info("Created new discount coupon: {}", couponCode);
        return savedCoupon;
    }

    @Override
    @Transactional
    public DiscountCoupon applyCoupon(String couponCode) {
        DiscountCoupon coupon = getValidCoupon(couponCode);

        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new DiscountCouponException("Coupon usage limit exceeded");
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        DiscountCoupon updatedCoupon = discountCouponRepository.save(coupon);
        log.info("Applied coupon: {}, new usage count: {}", couponCode, updatedCoupon.getUsedCount());
        return updatedCoupon;
    }

    @Override
    @Transactional
    public void deactivateCoupon(String couponCode) {
        DiscountCoupon coupon = getCouponByCode(couponCode);

        if (!coupon.isActive()) {
            log.warn("Coupon {} is already deactivated.", couponCode);
            return;
        }

        coupon.setActive(false);
        discountCouponRepository.save(coupon);
        log.info("Deactivated coupon: {}", couponCode);
    }


    @Override
    public DiscountCoupon getCouponByCode(String couponCode) {
        return discountCouponRepository.findById(couponCode)
                .orElseThrow(() -> new DiscountCouponException("Coupon not found"));
    }

    @Override
    public List<DiscountCoupon> getActiveCoupons() {
        return discountCouponRepository.findByExpiryDateAfter(LocalDate.now());
    }

    @Override
    public List<DiscountCoupon> getCouponsByType(DiscountType discountType) {
        return discountCouponRepository.findByDiscountType(discountType);
    }

    @Override
    public boolean isCouponValid(String couponCode) {
        try {
            getValidCoupon(couponCode);
            return true;
        } catch (DiscountCouponException e) {
            return false;
        }
    }

    @Override
    public DiscountCoupon updateCoupon(DiscountCoupon coupon) {
        DiscountCoupon existingCoupon = getCouponByCode(coupon.getCouponCode());
        existingCoupon.setUsageLimit(coupon.getUsageLimit());
        existingCoupon.setDescription(coupon.getDescription());
        return discountCouponRepository.save(existingCoupon);
    }

    private DiscountCoupon getValidCoupon(String couponCode) {
        DiscountCoupon coupon = getCouponByCode(couponCode);

        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new DiscountCouponException("Coupon has expired");
        }

        return coupon;
    }

    private void validateCouponParameters(DiscountType discountType, BigDecimal discountValue,
                                          LocalDate expiryDate, Integer usageLimit) {
        if (discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new DiscountCouponException("Discount value must be positive");
        }

        if (discountType == DiscountType.PERCENTAGE && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new DiscountCouponException("Percentage discount cannot exceed 100%");
        }

        if (expiryDate.isBefore(LocalDate.now())) {
            throw new DiscountCouponException("Expiry date must be in the future");
        }

        if (usageLimit <= 0) {
            throw new DiscountCouponException("Usage limit must be positive");
        }
    }
}