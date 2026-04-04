package com.gigshield.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProcessClaimRequest {
    /** APPROVE or REJECT */
    @NotBlank
    private String action;
    private String reason;
}
