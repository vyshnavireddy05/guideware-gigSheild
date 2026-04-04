package com.gigshield.service;

import com.gigshield.model.*;
import com.gigshield.repository.PolicyRepository;
import com.gigshield.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private static final BigDecimal BASE_PREMIUM = new BigDecimal("30");

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> quote(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        LocalDate today = LocalDate.now();
        LocalDate ws = WeekUtil.weekStart(today);
        LocalDate we = WeekUtil.weekEnd(ws);

        BigDecimal zoneMult = switch (user.getRiskLevel()) {
            case LOW -> BigDecimal.ONE;
            case MEDIUM -> new BigDecimal("1.3");
            case HIGH -> new BigDecimal("1.6");
        };

        int month = today.getMonthValue();
        BigDecimal seasonMult;
        if (month >= 6 && month <= 9) {
            seasonMult = new BigDecimal("1.4");
        } else if (month >= 3 && month <= 5) {
            seasonMult = new BigDecimal("1.2");
        } else {
            seasonMult = BigDecimal.ONE;
        }

        BigDecimal raw = BASE_PREMIUM.multiply(zoneMult).multiply(seasonMult);
        BigDecimal weeklyPremium = raw.max(BASE_PREMIUM).min(new BigDecimal("120")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal maxCoverage = user.getAvgWeeklyIncome()
                .multiply(new BigDecimal("0.70"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal afterZone = BASE_PREMIUM.multiply(zoneMult);
        BigDecimal zoneAddon = afterZone.subtract(BASE_PREMIUM).setScale(2, RoundingMode.HALF_UP);
        BigDecimal seasonAddon = afterZone.multiply(seasonMult).subtract(afterZone).setScale(2, RoundingMode.HALF_UP);

        List<String> zoneFactors = List.of(
                "Moderate flood history in similar zones",
                "High traffic density during peak hours"
        );

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("weeklyPremium", weeklyPremium);
        out.put("maxCoverageAmount", maxCoverage);
        out.put("coverageHours", 60);
        out.put("weekStartDate", ws.toString());
        out.put("weekEndDate", we.toString());
        out.put("riskLevel", user.getRiskLevel().name());
        out.put("zoneFactors", zoneFactors);
        out.put("basePremium", BASE_PREMIUM.setScale(2, RoundingMode.HALF_UP));
        out.put("zoneMultiplier", zoneMult);
        out.put("seasonMultiplier", seasonMult);
        out.put("zoneRiskAddon", zoneAddon);
        out.put("seasonFactorAddon", seasonAddon);
        out.put("hourlyRateCovered", user.getHourlyRate());
        return out;
    }

    @Transactional
    public Policy purchase(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Map<String, Object> q = quote(userId);
        LocalDate ws = LocalDate.parse((String) q.get("weekStartDate"));
        LocalDate we = LocalDate.parse((String) q.get("weekEndDate"));

        policyRepository.findActiveForUserOnDate(userId, LocalDate.now()).ifPresent(p -> {
            throw new IllegalStateException("Active policy already exists for this week");
        });

        Policy p = new Policy();
        p.setUser(user);
        p.setWeekStartDate(ws);
        p.setWeekEndDate(we);
        p.setWeeklyPremium((BigDecimal) q.get("weeklyPremium"));
        p.setMaxCoverageAmount((BigDecimal) q.get("maxCoverageAmount"));
        p.setCoverageHours(60);
        p.setStatus(PolicyStatus.ACTIVE);
        p.setPaymentStatus(PaymentStatus.PAID);
        return policyRepository.save(p);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> active(Long userId) {
        return policyRepository.findActiveForUserOnDate(userId, LocalDate.now())
                .map(this::toMap)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> history(Long userId) {
        return policyRepository.findByUser_IdOrderByWeekStartDateDesc(userId).stream()
                .map(this::toMap)
                .toList();
    }

    public Map<String, Object> toMap(Policy p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("userId", p.getUser().getId());
        m.put("weekStartDate", p.getWeekStartDate().toString());
        m.put("weekEndDate", p.getWeekEndDate().toString());
        m.put("weeklyPremium", p.getWeeklyPremium());
        m.put("maxCoverageAmount", p.getMaxCoverageAmount());
        m.put("coverageHours", p.getCoverageHours());
        m.put("status", p.getStatus().name());
        m.put("paymentStatus", p.getPaymentStatus().name());
        m.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return m;
    }
}
