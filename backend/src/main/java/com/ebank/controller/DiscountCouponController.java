package com.ebank.controller;

import com.ebank.model.discountCoupon.DiscountCoupon;
import com.ebank.model.discountCoupon.DiscountType;
import com.ebank.service.DiscountCouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Discount Coupon Management", description = "APIs for managing discount coupons")
public class DiscountCouponController {

    private final DiscountCouponService discountCouponService;

    @Operation(
            summary = "Create new discount coupon",
            description = "Create a new discount coupon with specified parameters",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Coupon created successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input parameters"),
                    @ApiResponse(responseCode = "409", description = "Coupon code already exists")
            }
    )
    @PostMapping
    public ResponseEntity<DiscountCoupon> createCoupon(
            @RequestParam String couponCode,
            @RequestParam String description,
            @RequestParam DiscountType discountType,
            @RequestParam BigDecimal discountValue,
            @RequestParam LocalDate expiryDate,
            @RequestParam Integer usageLimit
    ) {
        DiscountCoupon newCoupon = discountCouponService.createCoupon(
                couponCode, description, discountType, discountValue, expiryDate, usageLimit
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(newCoupon);
    }

    @Operation(
            summary = "Apply coupon",
            description = "Apply a coupon and increment usage count",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Coupon applied successfully"),
                    @ApiResponse(responseCode = "400", description = "Coupon is invalid or expired"),
                    @ApiResponse(responseCode = "404", description = "Coupon not found")
            }
    )
    @PostMapping("/{couponCode}/apply")
    public ResponseEntity<DiscountCoupon> applyCoupon(
            @PathVariable String couponCode
    ) {
        return ResponseEntity.ok(discountCouponService.applyCoupon(couponCode));
    }

    @Operation(
            summary = "Deactivate coupon",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Coupon deactivated"),
                    @ApiResponse(responseCode = "404", description = "Coupon not found")
            }
    )
    @DeleteMapping("/{couponCode}")
    public ResponseEntity<Void> deactivateCoupon(
            @PathVariable String couponCode
    ) {
        discountCouponService.deactivateCoupon(couponCode);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get coupon details by code")
    @GetMapping("/{couponCode}")
    public ResponseEntity<DiscountCoupon> getCouponByCode(
            @PathVariable String couponCode
    ) {
        return ResponseEntity.ok(discountCouponService.getCouponByCode(couponCode));
    }

    @Operation(summary = "Get active coupons")
    @GetMapping("/active")
    public ResponseEntity<List<DiscountCoupon>> getActiveCoupons() {
        return ResponseEntity.ok(discountCouponService.getActiveCoupons());
    }

    @Operation(summary = "Get coupons by type")
    @GetMapping("/type/{discountType}")
    public ResponseEntity<List<DiscountCoupon>> getCouponsByType(
            @PathVariable DiscountType discountType
    ) {
        return ResponseEntity.ok(discountCouponService.getCouponsByType(discountType));
    }

    @Operation(summary = "Check coupon validity")
    @GetMapping("/{couponCode}/validity")
    public ResponseEntity<Boolean> checkCouponValidity(
            @PathVariable String couponCode
    ) {
        return ResponseEntity.ok(discountCouponService.isCouponValid(couponCode));
    }

    @Operation(
            summary = "Update coupon usage limit",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Usage limit updated"),
                    @ApiResponse(responseCode = "400", description = "Invalid limit value"),
                    @ApiResponse(responseCode = "404", description = "Coupon not found")
            }
    )
    @PatchMapping("/{couponCode}/usage-limit")
    public ResponseEntity<DiscountCoupon> updateUsageLimit(
            @PathVariable String couponCode,
            @RequestParam Integer newLimit
    ) {
        DiscountCoupon coupon = discountCouponService.getCouponByCode(couponCode);
        coupon.setUsageLimit(newLimit);
        return ResponseEntity.ok(discountCouponService.updateCoupon(coupon));
    }
}