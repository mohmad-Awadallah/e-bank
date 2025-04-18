package com.ebank.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
public class ApiResponse {
    private boolean success;
    private String message;
    private HttpStatus status;
    private Object data;

    public ApiResponse(boolean success, String message, HttpStatus status) {
        this(success, message, status, null);
    }
}