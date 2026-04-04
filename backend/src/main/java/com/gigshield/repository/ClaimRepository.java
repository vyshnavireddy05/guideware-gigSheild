package com.gigshield.repository;

import com.gigshield.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByUser_IdOrderByCreatedAtDesc(Long userId);

    boolean existsByUser_IdAndDisruption_Id(Long userId, Long disruptionId);

    long countByUser_IdAndCreatedAtBetween(Long userId, Instant start, Instant end);

    List<Claim> findAllByOrderByCreatedAtDesc();

    long countByCreatedAtAfter(Instant start);

    @Query("select c.disruption.disruptionType, count(c) from Claim c where c.createdAt >= :start group by c.disruption.disruptionType")
    List<Object[]> countByDisruptionTypeSince(@Param("start") Instant start);

    List<Claim> findByCreatedAtAfter(Instant start);

    long countByUser_Id(Long userId);

    @Query("select coalesce(sum(c.approvedAmount), 0) from Claim c where c.user.id = :userId "
            + "and c.createdAt >= :start and c.status = 'PAID'")
    BigDecimal sumPaidClaimsForUserSince(@Param("userId") Long userId, @Param("start") Instant start);
}
