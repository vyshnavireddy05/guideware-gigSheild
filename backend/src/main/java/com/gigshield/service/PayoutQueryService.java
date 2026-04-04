package com.gigshield.service;

import com.gigshield.config.SecurityUtils;
import com.gigshield.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayoutQueryService {

    private final PayoutRepository payoutRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> myPayouts(Long userId) {
        SecurityUtils.requireWorkerOrAdmin(userId);
        return payoutRepository.findByUser_IdOrderByInitiatedAtDesc(userId).stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("claimId", p.getClaim().getId());
                    m.put("amount", p.getAmount());
                    m.put("upiId", p.getUpiId());
                    m.put("transactionId", p.getTransactionId());
                    m.put("status", p.getStatus().name());
                    m.put("initiatedAt", p.getInitiatedAt() != null ? p.getInitiatedAt().toString() : null);
                    m.put("completedAt", p.getCompletedAt() != null ? p.getCompletedAt().toString() : null);
                    return m;
                })
                .toList();
    }
}
