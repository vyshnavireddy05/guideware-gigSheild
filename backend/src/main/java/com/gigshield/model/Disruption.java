package com.gigshield.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "disruptions")
@Data
public class Disruption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "disruption_type", nullable = false)
    private DisruptionType disruptionType;

    @Column(nullable = false, length = 50)
    private String city;

    @Column(length = 100)
    private String zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "api_source", length = 100)
    private String apiSource;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_data", columnDefinition = "json")
    private String rawData;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}
