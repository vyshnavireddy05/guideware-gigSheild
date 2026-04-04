package com.gigshield.service;

import com.gigshield.config.SecurityUtils;
import com.gigshield.dto.ProcessClaimRequest;
import com.gigshield.model.Claim;
import com.gigshield.model.ClaimStatus;
import com.gigshield.repository.ClaimRepository;
import com.gigshield.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PayoutRepository payoutRepository;
    private final PayoutService payoutService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> myClaims(Long userId) {
        SecurityUtils.requireWorkerOrAdmin(userId);
        return claimRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDetailMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> allClaims() {
        SecurityUtils.requireAdmin();
        return claimRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDetailMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> processClaim(Long claimId, ProcessClaimRequest req) {
        SecurityUtils.requireAdmin();
        Claim c = claimRepository.findById(claimId).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        if (c.getStatus() != ClaimStatus.FRAUD_CHECK) {
            throw new IllegalStateException("Claim is not in FRAUD_CHECK status");
        }
        String action = req.getAction() != null ? req.getAction().toUpperCase() : "";
        if ("APPROVE".equals(action)) {
            c.setApprovedAmount(c.getClaimedAmount());
            c.setStatus(ClaimStatus.APPROVED);
            c.setProcessedAt(Instant.now());
            claimRepository.save(c);
            payoutService.initiatePayout(c);
        } else if ("REJECT".equals(action)) {
            c.setStatus(ClaimStatus.REJECTED);
            c.setRejectionReason(req.getReason() != null ? req.getReason() : "Rejected by admin");
            c.setProcessedAt(Instant.now());
            claimRepository.save(c);
        } else {
            throw new IllegalArgumentException("action must be APPROVE or REJECT");
        }
        return toDetailMap(claimRepository.findById(claimId).orElseThrow());
    }

    private Map<String, Object> toDetailMap(Claim c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("userId", c.getUser().getId());
        m.put("workerName", c.getUser().getName());
        m.put("zone", c.getUser().getZone());
        m.put("policyId", c.getPolicy().getId());
        m.put("disruptionId", c.getDisruption().getId());
        m.put("disruptionType", c.getDisruption().getDisruptionType().name());
        m.put("disruptionSeverity", c.getDisruption().getSeverity().name());
        m.put("disruptionStartedAt", c.getDisruption().getStartedAt() != null ? c.getDisruption().getStartedAt().toString() : null);
        m.put("disruptionHours", c.getDisruptionHours());
        m.put("claimedAmount", c.getClaimedAmount());
        m.put("approvedAmount", c.getApprovedAmount());
        m.put("fraudScore", c.getFraudScore());
        m.put("status", c.getStatus().name());
        m.put("rejectionReason", c.getRejectionReason());
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        m.put("processedAt", c.getProcessedAt() != null ? c.getProcessedAt().toString() : null);
        if (c.getStatus() == ClaimStatus.PAID) {
            payoutRepository.findFirstByClaim_IdOrderByInitiatedAtDesc(c.getId())
                    .ifPresent(p -> m.put("payoutTransactionId", p.getTransactionId()));
        }
        return m;
    }
}
