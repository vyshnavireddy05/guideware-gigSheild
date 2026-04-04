package com.gigshield.dto;

import com.gigshield.model.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;
    @NotBlank
    private String phone;
    private String email;
    @NotBlank
    private String password;
    @NotNull
    private Platform platform;
    @NotBlank
    private String city;
    @NotBlank
    private String zone;
    @NotNull
    private BigDecimal avgWeeklyIncome;
    private String upiId;
    private String aadhaarNumber;

    /** Phase 3 stub — optional GPS */
    private Double latitude;
    private Double longitude;
}
