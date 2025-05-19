package com.ebank.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class JwtRefreshTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtRefreshTokenFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtRefreshTokenFilter(JwtTokenProvider jwtTokenProvider,
                                 CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String refreshToken = extractRefreshToken(request);

        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            try {
                Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
                UserPrincipal userPrincipal = userDetailsService.loadUserById(userId);

                String newAccessToken = jwtTokenProvider.generateAccessToken(userPrincipal);
                response.setHeader("Authorization", "Bearer " + newAccessToken);

            } catch (Exception ex) {
                logger.error("Failed to refresh token", ex);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshtoken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String header = request.getHeader("X-Refresh-Token");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}