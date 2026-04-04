package com.gigshield.repository;

import com.gigshield.model.Policy;
import com.gigshield.model.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

    List<Policy> findByUser_IdAndStatus(Long userId, PolicyStatus status);

    List<Policy> findAllByStatus(PolicyStatus status);

    @Query("SELECT p FROM Policy p WHERE p.user.id = :userId AND p.status = 'ACTIVE' AND :today BETWEEN p.weekStartDate AND p.weekEndDate")
    Optional<Policy> findActiveForUserOnDate(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT DISTINCT p.user.city FROM Policy p WHERE p.status = 'ACTIVE' AND :today BETWEEN p.weekStartDate AND p.weekEndDate")
    List<String> findDistinctCitiesWithActivePolicies(@Param("today") LocalDate today);

    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' AND :today BETWEEN p.weekStartDate AND p.weekEndDate AND p.user.city = :city")
    List<Policy> findActivePoliciesInCity(@Param("city") String city, @Param("today") LocalDate today);

    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' AND :today BETWEEN p.weekStartDate AND p.weekEndDate AND p.user.city = :city AND p.user.zone = :zone")
    List<Policy> findActivePoliciesInCityAndZone(@Param("city") String city, @Param("zone") String zone, @Param("today") LocalDate today);

    List<Policy> findByUser_IdOrderByWeekStartDateDesc(Long userId);

    @Query("select coalesce(sum(p.weeklyPremium), 0) from Policy p where p.paymentStatus = 'PAID'")
    BigDecimal totalPremiumsCollected();

    @Query("select count(p) from Policy p where p.status = 'ACTIVE' and :today between p.weekStartDate and p.weekEndDate")
    long countActivePoliciesForWeek(@Param("today") LocalDate today);
}
