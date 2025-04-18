package com.ebank.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class AccountDetailsDTO extends AccountDTO {
    private UserDTO user;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}