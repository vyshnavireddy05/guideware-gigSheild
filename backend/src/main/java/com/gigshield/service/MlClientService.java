package com.gigshield.service;

import com.gigshield.model.Platform;
import com.gigshield.model.RiskLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MlClientService {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:5000}")
    private String mlBaseUrl;

    public MlRiskResult fetchRisk(String city, String zone, Platform platform) {
        String url = mlBaseUrl.replaceAll("/$", "") + "/risk-score";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = new HashMap<>();
        body.put("city", city);
        body.put("zone", zone);
        body.put("platform", platform != null ? platform.name() : "");
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> res = restTemplate.postForObject(url, new HttpEntity<>(body, headers), Map.class);
            if (res == null) {
                return defaults();
            }
            double rs = ((Number) res.getOrDefault("risk_score", 0.5)).doubleValue();
            String rl = String.valueOf(res.getOrDefault("risk_level", "MEDIUM"));
            RiskLevel level;
            try {
                level = RiskLevel.valueOf(rl);
            } catch (Exception e) {
                level = RiskLevel.MEDIUM;
            }
            @SuppressWarnings("unchecked")
            List<String> factors = (List<String>) res.get("zone_factors");
            return new MlRiskResult(BigDecimal.valueOf(rs).setScale(2, java.math.RoundingMode.HALF_UP), level, factors);
        } catch (Exception e) {
            return defaults();
        }
    }

    private MlRiskResult defaults() {
        return new MlRiskResult(new BigDecimal("0.50"), RiskLevel.MEDIUM, List.of("ML service unavailable — default risk applied"));
    }

    public record MlRiskResult(BigDecimal riskScore, RiskLevel riskLevel, List<String> zoneFactors) {
    }
}
