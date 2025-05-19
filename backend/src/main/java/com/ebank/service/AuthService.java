package com.ebank.service;

import com.ebank.dto.ApiResponse;
import com.ebank.dto.LoginRequest;
import com.ebank.dto.RegistrationRequest;
import com.ebank.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ApiResponse registerUser(RegistrationRequest request);
    ApiResponse loginUser(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response);
    void logoutUser(HttpServletResponse response);
}