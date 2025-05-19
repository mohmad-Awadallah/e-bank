package com.ebank.dto;

import com.ebank.model.user.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 6, max = 20, message = "Username must be 6-20 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()]).{8,}$",
            message = "Password must be 8+ chars with 1 uppercase & 1 special character"
    )
    private String password;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    private String firstName;
    private String lastName;

    private Role role;

    @Pattern(regexp = "^\\+?[0-9\\s-]+$", message = "Invalid phone number format")
    private String phoneNumber;
}