package com.ebank.repository;

import com.ebank.model.discountCoupon.DiscountCoupon;
import com.ebank.model.discountCoupon.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DiscountCouponRepository extends JpaRepository<DiscountCoupon, String> {
    List<DiscountCoupon> findByExpiryDateAfter(LocalDate date);
    List<DiscountCoupon> findByDiscountType(DiscountType discountType);
}
