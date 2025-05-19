// -------- SecurityConstants.java --------
package com.ebank.config;

public final class SecurityConstants {

    private SecurityConstants() { throw new IllegalStateException("Utility class"); }

    // Header names
    public static final String TOKEN_HEADER = "Authorization";
    public static final String REFRESH_TOKEN_HEADER = "X-Refresh-Token";
    public static final String TOKEN_PREFIX = "Bearer ";

    // CORS
    public static final String[] ALLOWED_ORIGINS = {"http://localhost:3000", "http://localhost:8081"};
    public static final String[] ALLOWED_METHODS = {"GET","POST","PUT","DELETE","PATCH","OPTIONS"};
    public static final String[] ALLOWED_HEADERS = { TOKEN_HEADER, "Content-Type", REFRESH_TOKEN_HEADER, "Cookie" };
    public static final String[] EXPOSED_HEADERS = { TOKEN_HEADER, REFRESH_TOKEN_HEADER, "Set-Cookie" };

    // Public URLs (no authentication required)
    public static final String[] PUBLIC_URLS = {
            "/api/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/webjars/**"
    };

    // Roles (without ROLE_ prefix)
    public static final String ADMIN_ROLE = "ADMIN";
    public static final String USER_ROLE = "USER";
    public static final String AUDITOR_ROLE = "AUDITOR";

    // API Base Paths
    public static final String ADMIN_BASE_URL = "/api/admin";
    public static final String USER_BASE_URL = "/api/users";
    public static final String ACCOUNT_BASE_URL = "/accounts";
    public static final String TRANSACTION_BASE_URL = "/transactions";
    public static final String BILL_PAYMENT_BASE_URL = "/bill-payments";
    public static final String CREDIT_CARD_BASE_URL = "/credit-cards";
    public static final String WIRE_TRANSFER_BASE_URL = "/wire-transfers";
    public static final String WALLET_BASE_URL = "/digital-wallets";
    public static final String NOTIFICATION_BASE_URL = "/notifications";
    public static final String SECURITY_LOG_BASE_URL = "/security-logs";
    public static final String COUPON_BASE_URL = "/discount-coupons";
    public static final String ANALYTICS_BASE_URL = "/analytics";


    // Password settings
    public static final int PASSWORD_STRENGTH = 12;
}