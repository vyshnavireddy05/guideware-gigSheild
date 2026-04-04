package com.gigshield.service;

import com.gigshield.model.Claim;
import com.gigshield.model.Disruption;
import com.gigshield.model.Policy;
import com.gigshield.model.User;
import com.gigshield.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final ClaimRepository claimRepository;

    /** Phase 3 stub — always false */
    public boolean checkGPSSpoofing(User user) {
        return false;
    }

    public BigDecimal calculateFraudScore(User user, Disruption disruption, BigDecimal claimedAmount, Policy policy) {
        double score = 0.0;

        if (disruption.getZone() != null && !disruption.getZone().isBlank()
                && !disruption.getZone().equalsIgnoreCase(user.getZone())) {
            score += 0.5;
        }

        Instant created = user.getCreatedAt();
        if (created != null && created.isAfter(Instant.now().minus(2, ChronoUnit.DAYS))) {
            score += 0.3;
        }

        // Duplicate claim same disruption (checked before insert in pipeline; kept for completeness)
        if (disruption.getId() != null
                && claimRepository.existsByUser_IdAndDisruption_Id(user.getId(), disruption.getId())) {
            score += 1.0;
        }

        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long n = claimRepository.countByUser_IdAndCreatedAtBetween(user.getId(), weekAgo, Instant.now());
        if (n > 3) {
            score += 0.2;
        }

        if (claimedAmount != null && policy.getMaxCoverageAmount() != null
                && claimedAmount.compareTo(policy.getMaxCoverageAmount()) > 0) {
            score += 0.3;
        }

        if (checkGPSSpoofing(user)) {
            score += 0.5;
        }

        return BigDecimal.valueOf(Math.min(score, 1.0)).setScale(2, RoundingMode.HALF_UP);
    }
}
