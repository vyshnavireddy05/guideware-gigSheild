package com.gigshield.dto;

import com.gigshield.model.DisruptionType;
import com.gigshield.model.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MockDisruptionRequest {
    @NotNull
    private DisruptionType disruptionType;
    @NotBlank
    private String city;
    @NotBlank
    private String zone;
    @NotNull
    private Severity severity;
}
