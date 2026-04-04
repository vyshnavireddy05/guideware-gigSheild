package com.gigshield.config;

import com.gigshield.model.Platform;
import com.gigshield.model.Role;
import com.gigshield.model.RiskLevel;
import com.gigshield.model.User;
import com.gigshield.model.UserStatus;
import com.gigshield.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByPhone("9000000000").isPresent()) {
            return;
        }
        User admin = new User();
        admin.setName("GigShield Admin");
        admin.setPhone("9000000000");
        admin.setEmail("admin@gigshield.in");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setPlatform(Platform.ZOMATO);
        admin.setCity("Hyderabad");
        admin.setZone("Madhapur");
        admin.setAvgWeeklyIncome(new BigDecimal("10000"));
        admin.setHourlyRate(new BigDecimal("166.67"));
        admin.setRiskScore(new BigDecimal("0.35"));
        admin.setRiskLevel(RiskLevel.MEDIUM);
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setUpiId("admin@gigshield");
        userRepository.save(admin);
    }
}
