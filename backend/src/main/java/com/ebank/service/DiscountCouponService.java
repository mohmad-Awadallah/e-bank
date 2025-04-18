package com.ebank.service;

import com.ebank.model.discountCoupon.DiscountCoupon;
import com.ebank.model.discountCoupon.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DiscountCouponService {
    DiscountCoupon createCoupon(String couponCode, String description,
                                DiscountType discountType, BigDecimal discountValue,
                                LocalDate expiryDate, Integer usageLimit);

    DiscountCoupon applyCoupon(String couponCode);

    void deactivateCoupon(String couponCode);

    DiscountCoupon getCouponByCode(String couponCode);

    List<DiscountCoupon> getActiveCoupons();

    List<DiscountCoupon> getCouponsByType(DiscountType discountType);

    boolean isCouponValid(String couponCode);

    DiscountCoupon updateCoupon(DiscountCoupon coupon);

}