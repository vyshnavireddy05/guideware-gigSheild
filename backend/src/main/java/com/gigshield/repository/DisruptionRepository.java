package com.gigshield.repository;

import com.gigshield.model.Disruption;
import com.gigshield.model.DisruptionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface DisruptionRepository extends JpaRepository<Disruption, Long> {

    List<Disruption> findByCityAndEndedAtIsNull(String city);

    boolean existsByCityAndDisruptionTypeAndStartedAtAfter(String city, DisruptionType type, Instant after);

    List<Disruption> findByCityAndZoneAndEndedAtIsNull(String city, String zone);

    List<Disruption> findAllByOrderByStartedAtDesc();
}
