package com.ebank.service;

import com.ebank.dto.ApiResponse;
import com.ebank.dto.LoginRequest;
import com.ebank.dto.RegistrationRequest;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ApiResponse registerUser(RegistrationRequest request);
    ApiResponse loginUser(LoginRequest request);
}