package com.ebank.controller;

import com.ebank.dto.ApiResponse;
import com.ebank.dto.LoginRequest;
import com.ebank.dto.RegistrationRequest;
import com.ebank.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(
            @RequestBody @Valid RegistrationRequest request) {
        ApiResponse response = authService.registerUser(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> loginUser(
            @RequestBody @Valid LoginRequest request) {
        ApiResponse response = authService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}