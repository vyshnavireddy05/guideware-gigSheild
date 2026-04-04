package com.gigshield.service;

import com.gigshield.config.SecurityUtils;
import com.gigshield.model.Claim;
import com.gigshield.model.DisruptionType;
import com.gigshield.model.User;
import com.gigshield.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PayoutRepository payoutRepository;
    private final DisruptionRepository disruptionRepository;
    private final PolicyService policyService;

    @Transactional(readOnly = true)
    public Map<String, Object> worker(Long userId) {
        SecurityUtils.requireWorkerOrAdmin(userId);
        User user = userRepository.findById(userId).orElseThrow();

        Map<String, Object> activePolicy = policyService.active(userId);
        BigDecimal totalPayouts = payoutRepository.totalPaidForUser(userId);
        if (totalPayouts == null) {
            totalPayouts = BigDecimal.ZERO;
        }
        long totalClaims = claimRepository.countByUser_Id(userId);

        LocalDate today = LocalDate.now();
        Instant weekStart = WeekUtil.weekStart(today).atStartOfDay(ZoneId.systemDefault()).toInstant();
        BigDecimal incomeWeek = claimRepository.sumPaidClaimsForUserSince(userId, weekStart);
        if (incomeWeek == null) {
            incomeWeek = BigDecimal.ZERO;
        }

        List<Map<String, Object>> recent = claimRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .limit(5)
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
                    m.put("disruptionType", c.getDisruption().getDisruptionType().name());
                    m.put("disruptionHours", c.getDisruptionHours());
                    m.put("claimedAmount", c.getClaimedAmount());
                    m.put("approvedAmount", c.getApprovedAmount());
                    m.put("status", c.getStatus().name());
                    return m;
                })
                .toList();

        boolean disruptionActive = disruptionRepository.findByCityAndEndedAtIsNull(user.getCity()).stream()
                .anyMatch(d -> d.getZone() == null || d.getZone().isBlank()
                        || d.getZone().equalsIgnoreCase(user.getZone()));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("activePolicy", activePolicy);
        out.put("totalPayoutsReceived", totalPayouts);
        out.put("totalClaimsCount", totalClaims);
        out.put("incomeProtectedThisWeek", incomeWeek);
        out.put("recentClaims", recent);
        out.put("isDisruptionActiveInZone", disruptionActive);
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> admin() {
        SecurityUtils.requireAdmin();

        long totalWorkers = userRepository.count();
        long activePolicies = policyRepository.countActivePoliciesForWeek(LocalDate.now());
        BigDecimal premiums = policyRepository.totalPremiumsCollected();
        if (premiums == null) {
            premiums = BigDecimal.ZERO;
        }
        BigDecimal payouts = payoutRepository.totalSuccessfulAmount();
        if (payouts == null) {
            payouts = BigDecimal.ZERO;
        }

        Instant weekStart = WeekUtil.weekStart(LocalDate.now()).atStartOfDay(ZoneId.systemDefault()).toInstant();
        long claimsThisWeek = claimRepository.countByCreatedAtAfter(weekStart);

        BigDecimal lossRatio = BigDecimal.ZERO;
        if (premiums.compareTo(BigDecimal.ZERO) > 0) {
            lossRatio = payouts.divide(premiums, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        List<Object[]> typeRows = claimRepository.countByDisruptionTypeSince(weekStart);
        List<Map<String, Object>> claimsByType = new ArrayList<>();
        for (Object[] row : typeRows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", ((DisruptionType) row[0]).name());
            m.put("count", ((Number) row[1]).longValue());
            claimsByType.add(m);
        }

        List<Map<String, Object>> dailyTrend = dailyClaimsTrend(weekStart);

        List<Map<String, Object>> zoneWise = zoneWiseRisk();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalWorkers", totalWorkers);
        out.put("totalActivePolicies", activePolicies);
        out.put("totalPremiumsCollected", premiums);
        out.put("totalPayoutsProcessed", payouts);
        out.put("totalClaimsThisWeek", claimsThisWeek);
        out.put("claimsByType", claimsByType);
        out.put("zoneWiseRiskData", zoneWise);
        out.put("lossRatio", lossRatio);
        out.put("dailyClaimsTrend", dailyTrend);
        return out;
    }

    private List<Map<String, Object>> dailyClaimsTrend(Instant weekStart) {
        List<Claim> claims = claimRepository.findByCreatedAtAfter(weekStart);
        ZoneId z = ZoneId.systemDefault();
        Map<LocalDate, Long> byDay = claims.stream()
                .collect(Collectors.groupingBy(
                        c -> LocalDate.ofInstant(c.getCreatedAt(), z),
                        Collectors.counting()
                ));
        List<Map<String, Object>> list = new ArrayList<>();
        LocalDate d = WeekUtil.weekStart(LocalDate.now());
        for (int i = 0; i < 7; i++) {
            LocalDate day = d.plusDays(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", day.toString());
            m.put("count", byDay.getOrDefault(day, 0L));
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> zoneWiseRisk() {
        List<User> users = userRepository.findAll();
        Map<String, List<User>> byZone = users.stream()
                .filter(u -> u.getZone() != null)
                .collect(Collectors.groupingBy(u -> u.getCity() + "|" + u.getZone()));

        List<Map<String, Object>> out = new ArrayList<>();
        for (Map.Entry<String, List<User>> e : byZone.entrySet()) {
            String[] parts = e.getKey().split("\\|", 2);
            String city = parts[0];
            String zone = parts.length > 1 ? parts[1] : "";
            List<User> list = e.getValue();
            double avgRisk = list.stream()
                    .mapToDouble(u -> u.getRiskScore() != null ? u.getRiskScore().doubleValue() : 0.5)
                    .average()
                    .orElse(0.5);
            long claimsCount = list.stream().mapToLong(u -> claimRepository.countByUser_Id(u.getId())).sum();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("zone", zone);
            row.put("city", city);
            row.put("workersCovered", list.size());
            row.put("avgRiskScore", BigDecimal.valueOf(avgRisk).setScale(2, RoundingMode.HALF_UP));
            row.put("claimsCount", claimsCount);
            String level = avgRisk > 0.6 ? "HIGH" : avgRisk > 0.35 ? "MEDIUM" : "LOW";
            row.put("riskLevel", level);
            out.add(row);
        }
        out.sort(Comparator.comparing(m -> (String) m.get("city") + m.get("zone")));
        return out;
    }
}
