package com.ebank.dto;

import lombok.Data;

@Data
public class AccountCreationDTO {
    private Long userId;
    private String accountType;
    private String accountName;
    private String currency;
}