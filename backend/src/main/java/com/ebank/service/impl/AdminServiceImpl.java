package com.ebank.service.impl;

import com.ebank.model.securityLog.LogStatus;
import com.ebank.model.user.User;
import com.ebank.repository.*;
import com.ebank.service.AdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final WireTransferRepository wireTransferRepository;
    private final CreditCardRepository creditCardRepository;
    private final DigitalWalletRepository digitalWalletRepository;
    private final NotificationRepository notificationRepository;
    private final DiscountCouponRepository discountCouponRepository;
    private final SecurityLogRepository securityLogRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            WireTransferRepository wireTransferRepository,
                            CreditCardRepository creditCardRepository,
                            DigitalWalletRepository digitalWalletRepository,
                            NotificationRepository notificationRepository,
                            DiscountCouponRepository discountCouponRepository,
                            SecurityLogRepository securityLogRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.wireTransferRepository = wireTransferRepository;
        this.creditCardRepository = creditCardRepository;
        this.digitalWalletRepository = digitalWalletRepository;
        this.notificationRepository = notificationRepository;
        this.discountCouponRepository = discountCouponRepository;
        this.securityLogRepository = securityLogRepository;
    }

    @Override
    public Map<String, Object> getSystemStats() {
        // تحديد بداية اليوم
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        // الحصول على الوقت الحالي
        LocalDateTime now = LocalDateTime.now();

        // جمع الإحصائيات في خريطة
        Map<String, Object> stats = new HashMap<>();

        // إحصائيات النظام
        stats.put("totalUsers", userRepository.count());  // إجمالي عدد المستخدمين
        stats.put("activeUsers", userRepository.countByEnabled(true));  // عدد المستخدمين النشطين
        stats.put("inactiveUsers", userRepository.countByEnabled(false));  // عدد المستخدمين الغير نشطين
        stats.put("totalAccounts", accountRepository.count());  // إجمالي عدد الحسابات
        stats.put("todaysTransactions", transactionRepository.countByCreatedAtBetween(startOfDay, now));  // المعاملات لهذا اليوم
        stats.put("totalWireTransfers", wireTransferRepository.count());  // إجمالي تحويلات الأموال
        stats.put("totalCreditCards", creditCardRepository.count());  // إجمالي بطاقات الائتمان
        stats.put("totalWallets", digitalWalletRepository.count());  // إجمالي المحافظ الرقمية
        stats.put("todaysNotifications", notificationRepository.countByCreatedAtBetween(startOfDay, now));  // الإشعارات لهذا اليوم
        stats.put("activeCoupons", discountCouponRepository.countByActive(true));  // القسائم النشطة
        stats.put("todaysLogins", securityLogRepository.countByActionAndStatusAndCreatedAtBetween("LOGIN_SUCCESS", LogStatus.SUCCESS, startOfDay, now));  // تسجيلات الدخول لهذا اليوم
        stats.put("todaysNewUsers", userRepository.countByCreatedAtBetween(startOfDay, now));  // المستخدمين الجدد لهذا اليوم

        return stats;
    }

    @Override
    public List<User> getRecentUsers(int count) {
        int safeCount = Math.min(count, 100);
        Pageable pageable = PageRequest.of(0, safeCount, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageable).getContent();
    }
}
