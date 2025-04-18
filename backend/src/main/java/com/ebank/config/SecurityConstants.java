package com.ebank.config;

public class SecurityConstants {

    // Headers
    public static final String TOKEN_HEADER = "Authorization";
    public static final String REFRESH_TOKEN_HEADER = "X-Refresh-Token";
    public static final String TOKEN_PREFIX = "Bearer ";

    // CORS Configuration
    public static final String[] ALLOWED_ORIGINS = {"https://frontend-domain.com"};
    public static final String[] ALLOWED_METHODS = {"GET", "POST", "PUT", "DELETE", "OPTIONS"};
    public static final String[] ALLOWED_HEADERS = {"Authorization", "Cache-Control", "Content-Type"};
    public static final String[] EXPOSED_HEADERS = {REFRESH_TOKEN_HEADER};

    // Public endpoints
    public static final String[] PUBLIC_URLS = {
            "/api/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/webjars/**"
    };

    // Roles
    public static final String ROLE_PREFIX = "ROLE_";
    public static final String ADMIN_ROLE = "ADMIN";
    public static final String USER_ROLE = "USER";
    public static final String AUDITOR_ROLE = "AUDITOR";

    // Security settings
    public static final int PASSWORD_STRENGTH = 12;

    // ============== API Paths ==============
    // Account Controller
    public static final String ACCOUNT_BASE_URL = "/api/accounts";
    public static final String[] ACCOUNT_API_PATHS = {
            ACCOUNT_BASE_URL + "/**",
            "/api/account/**"
    };

    // Transaction Controller
    public static final String TRANSACTION_BASE_URL = "/api/transactions";
    public static final String[] TRANSACTION_API_PATHS = {
            TRANSACTION_BASE_URL + "/**",
            "/api/transaction/**"
    };

    // Bill Payment Controller
    public static final String BILL_PAYMENT_BASE_URL = "/api/bill-payments";
    public static final String[] BILL_PAYMENT_API_PATHS = {
            BILL_PAYMENT_BASE_URL + "/**",
            "/api/bill/**"
    };

    // Credit Card Controller
    public static final String CREDIT_CARD_BASE_URL = "/api/credit-cards";
    public static final String[] CREDIT_CARD_API_PATHS = {
            CREDIT_CARD_BASE_URL + "/**",
            "/api/card/**"
    };

    // Wire Transfer Controller
    public static final String WIRE_TRANSFER_BASE_URL = "/api/wire-transfers";
    public static final String[] WIRE_TRANSFER_API_PATHS = {
            WIRE_TRANSFER_BASE_URL + "/**",
            "/api/wire/**"
    };

    // Digital Wallet Controller
    public static final String DIGITAL_WALLET_BASE_URL = "/api/digital-wallets";
    public static final String[] DIGITAL_WALLET_API_PATHS = {
            DIGITAL_WALLET_BASE_URL + "/**",
            "/api/wallet/**"
    };

    // Notification Controller
    public static final String NOTIFICATION_BASE_URL = "/api/notifications";
    public static final String[] NOTIFICATION_API_PATHS = {
            NOTIFICATION_BASE_URL + "/**",
            "/api/notify/**"
    };

    // Security Log Controller
    public static final String SECURITY_LOG_BASE_URL = "/api/security-logs";
    public static final String[] SECURITY_LOG_API_PATHS = {
            SECURITY_LOG_BASE_URL + "/**",
            "/api/logs/security/**"
    };

    // User Controller
    public static final String USER_BASE_URL = "/api/users";
    public static final String[] USER_API_PATHS = {
            USER_BASE_URL + "/**",
            "/api/user/**"
    };

    // Discount Coupon Controller
    public static final String DISCOUNT_COUPON_BASE_URL = "/api/discount-coupons";
    public static final String[] DISCOUNT_COUPON_API_PATHS = {
            DISCOUNT_COUPON_BASE_URL + "/**",
            "/api/coupon/**"
    };

    private SecurityConstants() {
        throw new IllegalStateException("Utility class");
    }
}