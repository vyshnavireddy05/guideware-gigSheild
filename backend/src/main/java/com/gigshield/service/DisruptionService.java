package com.gigshield.service;

import com.gigshield.dto.MockDisruptionRequest;
import com.gigshield.model.*;
import com.gigshield.repository.ClaimRepository;
import com.gigshield.repository.DisruptionRepository;
import com.gigshield.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DisruptionService {

    private final DisruptionRepository disruptionRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final FraudDetectionService fraudDetectionService;
    private final PayoutService payoutService;

    public List<Map<String, Object>> activeInCity(String city) {
        return disruptionRepository.findByCityAndEndedAtIsNull(city).stream()
                .map(this::disruptionMap)
                .toList();
    }

    public List<Map<String, Object>> all() {
        return disruptionRepository.findAllByOrderByStartedAtDesc().stream()
                .map(this::disruptionMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> mockTrigger(MockDisruptionRequest req) {
        Disruption d = new Disruption();
        d.setDisruptionType(req.getDisruptionType());
        d.setCity(req.getCity());
        d.setZone(req.getZone());
        d.setSeverity(req.getSeverity());
        d.setStartedAt(Instant.now());
        d.setApiSource("MOCK_ADMIN");
        disruptionRepository.save(d);

        LocalDate today = LocalDate.now();
        List<Policy> policies = policyRepository.findActivePoliciesInCityAndZone(req.getCity(), req.getZone(), today);
        List<Map<String, Object>> affected = new ArrayList<>();
        for (Policy pol : policies) {
            if (claimRepository.existsByUser_IdAndDisruption_Id(pol.getUser().getId(), d.getId())) {
                continue;
            }
            Claim c = buildAndProcessClaim(pol.getUser(), pol, d);
            if (c != null) {
                affected.add(Map.of(
                        "userId", pol.getUser().getId(),
                        "name", pol.getUser().getName(),
                        "zone", pol.getUser().getZone(),
                        "claimId", c.getId(),
                        "status", c.getStatus().name()
                ));
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("disruption", disruptionMap(d));
        out.put("affectedWorkers", affected);
        return out;
    }

    @Transactional
    public void processWeatherDisruption(DisruptionType type, String city, Severity severity, String source, String rawJson) {
        Instant since = Instant.now().minus(2, ChronoUnit.HOURS);
        if (disruptionRepository.existsByCityAndDisruptionTypeAndStartedAtAfter(city, type, since)) {
            return;
        }
        Disruption d = new Disruption();
        d.setDisruptionType(type);
        d.setCity(city);
        d.setZone(null);
        d.setSeverity(severity);
        d.setStartedAt(Instant.now());
        d.setApiSource(source);
        d.setRawData(rawJson);
        disruptionRepository.save(d);

        LocalDate today = LocalDate.now();
        List<Policy> policies = policyRepository.findActivePoliciesInCity(city, today);
        for (Policy pol : policies) {
            if (claimRepository.existsByUser_IdAndDisruption_Id(pol.getUser().getId(), d.getId())) {
                continue;
            }
            buildAndProcessClaim(pol.getUser(), pol, d);
        }
    }

    private Claim buildAndProcessClaim(User user, Policy policy, Disruption disruption) {
        BigDecimal hours = hoursForSeverity(disruption.getSeverity());
        BigDecimal hourly = user.getHourlyRate() != null ? user.getHourlyRate() : BigDecimal.ZERO;
        BigDecimal claimed = hourly.multiply(hours).setScale(2, RoundingMode.HALF_UP);
        if (claimed.compareTo(policy.getMaxCoverageAmount()) > 0) {
            claimed = policy.getMaxCoverageAmount();
        }

        BigDecimal fraudScore = fraudDetectionService.calculateFraudScore(user, disruption, claimed, policy);

        Claim c = new Claim();
        c.setUser(user);
        c.setPolicy(policy);
        c.setDisruption(disruption);
        c.setDisruptionHours(hours);
        c.setClaimedAmount(claimed);
        c.setFraudScore(fraudScore);
        c.setStatus(ClaimStatus.AUTO_INITIATED);
        claimRepository.save(c);

        if (fraudScore.compareTo(new BigDecimal("0.40")) < 0) {
            c.setApprovedAmount(claimed);
            c.setStatus(ClaimStatus.APPROVED);
            c.setProcessedAt(Instant.now());
            claimRepository.save(c);
            payoutService.initiatePayout(c);
        } else {
            c.setStatus(ClaimStatus.FRAUD_CHECK);
            claimRepository.save(c);
        }
        return c;
    }

    private static BigDecimal hoursForSeverity(Severity s) {
        return switch (s) {
            case LOW -> new BigDecimal("4");
            case MEDIUM -> new BigDecimal("6");
            case HIGH -> new BigDecimal("8");
            case EXTREME -> new BigDecimal("10");
        };
    }

    private Map<String, Object> disruptionMap(Disruption d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("disruptionType", d.getDisruptionType().name());
        m.put("city", d.getCity());
        m.put("zone", d.getZone());
        m.put("severity", d.getSeverity().name());
        m.put("startedAt", d.getStartedAt() != null ? d.getStartedAt().toString() : null);
        m.put("endedAt", d.getEndedAt() != null ? d.getEndedAt().toString() : null);
        m.put("apiSource", d.getApiSource());
        return m;
    }
}
