package com.ebank.config;

import com.ebank.security.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                          CustomUserDetailsService userDetailsService,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtRefreshTokenFilter refreshTokenFilter = new JwtRefreshTokenFilter(jwtTokenProvider, userDetailsService);
        JwtAuthenticationFilter authenticationFilter = new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);

        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)                        .accessDeniedHandler(new JwtAccessDeniedHandler()))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self' http://localhost:3000 'unsafe-inline'"))
                        .frameOptions(frame -> frame.sameOrigin())
                        .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .preload(true)
                                .maxAgeInSeconds(31536000)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(SecurityConstants.PUBLIC_URLS).permitAll()

                        .requestMatchers("/api/users/me").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE)

                        // Users
                        .requestMatchers(SecurityConstants.USER_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE)

                        // Accounts
                        .requestMatchers(SecurityConstants.ACCOUNT_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE, SecurityConstants.AUDITOR_ROLE)

                        // Transactions
                        .requestMatchers(SecurityConstants.TRANSACTION_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE, SecurityConstants.AUDITOR_ROLE)

                        // Bill Payments, Credit Cards, Wire Transfers, Wallets
                        .requestMatchers(
                                SecurityConstants.BILL_PAYMENT_BASE_URL + "/**",
                                SecurityConstants.CREDIT_CARD_BASE_URL + "/**",
                                SecurityConstants.WIRE_TRANSFER_BASE_URL + "/**",
                                SecurityConstants.WALLET_BASE_URL + "/**"
                        ).hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE)

                        // Notifications
                        .requestMatchers(SecurityConstants.NOTIFICATION_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE)

                        // Security Logs
                        .requestMatchers(SecurityConstants.SECURITY_LOG_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.AUDITOR_ROLE)

                        // Coupons
                        .requestMatchers(SecurityConstants.COUPON_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE)

                        // Admin
                        .requestMatchers(SecurityConstants.ADMIN_BASE_URL + "/**").hasRole(SecurityConstants.ADMIN_ROLE)

                        // Analytics
                        .requestMatchers(SecurityConstants.ANALYTICS_BASE_URL + "/**").hasAnyRole(SecurityConstants.ADMIN_ROLE, SecurityConstants.USER_ROLE)

                        // All other requests
                        .anyRequest().authenticated())
                .addFilterBefore(refreshTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(authenticationFilter, JwtRefreshTokenFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(SecurityConstants.ALLOWED_ORIGINS));
        config.setAllowedMethods(List.of(SecurityConstants.ALLOWED_METHODS));
        config.setAllowedHeaders(List.of(SecurityConstants.ALLOWED_HEADERS));
        config.setExposedHeaders(List.of(SecurityConstants.EXPOSED_HEADERS));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(SecurityConstants.PASSWORD_STRENGTH);
    }


    @Component
    static class JwtAccessDeniedHandler implements AccessDeniedHandler {
        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response,
                           AccessDeniedException accessDeniedException) throws IOException {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
        }
    }
}
