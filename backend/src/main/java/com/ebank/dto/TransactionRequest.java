package com.ebank.dto;

import com.ebank.model.transaction.TransactionType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionRequest {
    @NotBlank
    @JsonProperty("sourceAccountNumber")
    private String fromAccount;

    @NotBlank
    @JsonProperty("targetAccountNumber")
    private String toAccount;

    @Positive
    private BigDecimal amount;

    @NotNull
    private TransactionType type;

    @JsonProperty("reference")
    private String description;
}
