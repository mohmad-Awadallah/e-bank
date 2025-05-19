package com.ebank.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@AllArgsConstructor
public class PasswordChangeRequest {
    private String currentPassword;
    private String newPassword;

}
