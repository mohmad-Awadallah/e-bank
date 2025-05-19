package com.ebank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AccountCreationDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Account type is required")
    private String accountType;

    private String accountName;

    @NotBlank(message = "Currency is required")
    @Size(max = 3, message = "Currency code must be 3 characters")
    private String currency;

    @NotBlank(message = "Account number is required")
    @Size(min = 10, max = 20, message = "Account number must be 10-20 characters")
    @Pattern(regexp = "\\d+", message = "Account number must contain only digits")
    private String accountNumber;
}
