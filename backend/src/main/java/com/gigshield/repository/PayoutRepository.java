package com.gigshield.repository;

import com.gigshield.model.Payout;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PayoutRepository extends JpaRepository<Payout, Long> {

    List<Payout> findByUser_IdOrderByInitiatedAtDesc(Long userId);

    Optional<Payout> findFirstByClaim_IdOrderByInitiatedAtDesc(Long claimId);

    @Query("select coalesce(sum(p.amount), 0) from Payout p where p.status = 'SUCCESS'")
    BigDecimal totalSuccessfulAmount();

    @Query("select coalesce(sum(p.amount), 0) from Payout p where p.user.id = :userId and p.status = 'SUCCESS'")
    BigDecimal totalPaidForUser(@Param("userId") Long userId);
}
