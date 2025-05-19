package com.ebank.controller;

import com.ebank.dto.ApiResponse;
import com.ebank.dto.LoginRequest;
import com.ebank.dto.RegistrationRequest;
import com.ebank.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest,  // إضافة هذا البارامتر
            HttpServletResponse response
    ) {
        ApiResponse apiResponse = authService.loginUser(request, httpRequest, response);
        return ResponseEntity.ok(apiResponse);
    }


    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logoutUser(HttpServletResponse response) {
        authService.logoutUser(response);
        return ResponseEntity.ok(new ApiResponse(
                true,
                "Logout successful!",
                HttpStatus.OK,
                null
        ));
    }

}