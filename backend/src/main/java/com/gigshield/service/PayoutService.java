package com.gigshield.service;

import com.gigshield.model.Claim;
import com.gigshield.model.ClaimStatus;
import com.gigshield.model.Payout;
import com.gigshield.model.PayoutStatus;
import com.gigshield.repository.ClaimRepository;
import com.gigshield.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final ClaimRepository claimRepository;

    /** Phase 3 stub — mock Razorpay integration */
    public void initiateRazorpayPayout(Claim claim, BigDecimal amount) {
        // no-op stub for future Razorpay wiring
    }

    @Transactional
    public Payout initiatePayout(Claim claim) {
        initiateRazorpayPayout(claim, claim.getApprovedAmount());
        Payout p = new Payout();
        p.setClaim(claim);
        p.setUser(claim.getUser());
        p.setAmount(claim.getApprovedAmount());
        p.setUpiId(claim.getUser().getUpiId());
        String txn = "TXN" + System.currentTimeMillis();
        p.setTransactionId(txn);
        p.setStatus(PayoutStatus.SUCCESS);
        p.setCompletedAt(Instant.now());
        payoutRepository.save(p);

        claim.setStatus(ClaimStatus.PAID);
        claim.setProcessedAt(Instant.now());
        claimRepository.save(claim);
        return p;
    }
}
