package com.gigshield.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchasePolicyRequest {
    @NotNull
    private Long userId;
}
