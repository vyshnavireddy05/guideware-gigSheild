package com.gigshield.scheduler;

import com.gigshield.repository.PolicyRepository;
import com.gigshield.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DisruptionMonitorScheduler {

    private final PolicyRepository policyRepository;
    private final WeatherService weatherService;

    @Scheduled(fixedRate = 1800000)
    public void monitor() {
        LocalDate today = LocalDate.now();
        List<String> cities = policyRepository.findDistinctCitiesWithActivePolicies(today);
        for (String city : cities) {
            try {
                weatherService.pollCity(city);
            } catch (Exception e) {
                log.warn("Weather poll failed for {}: {}", city, e.getMessage());
            }
        }
    }
}
