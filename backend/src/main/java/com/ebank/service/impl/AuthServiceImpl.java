package com.ebank.service.impl;

import com.ebank.dto.*;
import com.ebank.exception.DuplicateResourceException;
import com.ebank.exception.InvalidCredentialsException;
import com.ebank.model.user.Role;
import com.ebank.model.user.User;
import com.ebank.repository.UserRepository;
import com.ebank.security.JwtTokenProvider;
import com.ebank.security.UserPrincipal;
import com.ebank.service.AuthService;
import com.ebank.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final String USER_CACHE_PREFIX = "user:";
    private static final int CACHE_EXPIRATION_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CacheService cacheService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public ApiResponse registerUser(RegistrationRequest request) {
        validateRegistrationRequest(request);
        User user = createUserFromRequest(request);
        userRepository.save(user);
        cacheUserData(user);

        log.info("New user registered: {}", user.getUsername());
        return new ApiResponse(
                true,
                "User registered successfully!",
                HttpStatus.CREATED,
                user.getUsername()
        );
    }

    @Override
    public ApiResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticateUser(request);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String jwtToken = jwtTokenProvider.generateAccessToken(userPrincipal);
        log.info("User logged in: {}", request.getUsername());

        return new ApiResponse(
                true,
                "Login successful!",
                HttpStatus.OK,
                new JwtResponse(jwtToken)
        );
    }

    // Helper Methods
    private void validateRegistrationRequest(RegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already in use!");
        }
    }

    private User createUserFromRequest(RegistrationRequest request) {
        return User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.ROLE_USER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void cacheUserData(User user) {
        String cacheKey = USER_CACHE_PREFIX + user.getId();
        cacheService.cacheData(cacheKey, user, User.class);
        cacheService.setExpiration(cacheKey, CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
    }

    private Authentication authenticateUser(LoginRequest request) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getUsername());
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }
}