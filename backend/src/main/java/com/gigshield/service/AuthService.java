package com.gigshield.service;

import com.gigshield.config.JwtUtil;
import com.gigshield.dto.LoginRequest;
import com.gigshield.dto.RegisterRequest;
import com.gigshield.model.Role;
import com.gigshield.model.User;
import com.gigshield.model.UserStatus;
import com.gigshield.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MlClientService mlClientService;

    @Transactional
    public Map<String, Object> register(RegisterRequest req) {
        if (userRepository.findByPhone(req.getPhone()).isPresent()) {
            throw new IllegalArgumentException("Phone already registered");
        }
        User u = new User();
        u.setName(req.getName());
        u.setPhone(req.getPhone());
        u.setEmail(req.getEmail());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setPlatform(req.getPlatform());
        u.setCity(req.getCity());
        u.setZone(req.getZone());
        u.setAvgWeeklyIncome(req.getAvgWeeklyIncome());
        u.setUpiId(req.getUpiId());
        u.setAadhaarNumber(req.getAadhaarNumber());
        u.setLatitude(req.getLatitude());
        u.setLongitude(req.getLongitude());
        BigDecimal hourly = req.getAvgWeeklyIncome()
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        u.setHourlyRate(hourly);

        MlClientService.MlRiskResult ml = mlClientService.fetchRisk(req.getCity(), req.getZone(), req.getPlatform());
        u.setRiskScore(ml.riskScore());
        u.setRiskLevel(ml.riskLevel());
        u.setStatus(UserStatus.ACTIVE);
        u.setRole(Role.WORKER);
        userRepository.save(u);

        String token = jwtUtil.generateToken(u.getId(), u.getPhone(), u.getRole());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("token", token);
        out.put("user", toUserMap(u, ml.zoneFactors()));
        return out;
    }

    public Map<String, Object> login(LoginRequest req) {
        User u = userRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (u.getPasswordHash() == null || !passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(u.getId(), u.getPhone(), u.getRole());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("token", token);
        out.put("user", toUserMap(u, null));
        return out;
    }

    public Map<String, Object> toUserMap(User u, java.util.List<String> zoneFactors) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("phone", u.getPhone());
        m.put("email", u.getEmail());
        m.put("platform", u.getPlatform().name());
        m.put("city", u.getCity());
        m.put("zone", u.getZone());
        m.put("avgWeeklyIncome", u.getAvgWeeklyIncome());
        m.put("hourlyRate", u.getHourlyRate());
        m.put("riskScore", u.getRiskScore());
        m.put("riskLevel", u.getRiskLevel().name());
        m.put("role", u.getRole().name());
        m.put("status", u.getStatus().name());
        m.put("upiId", u.getUpiId());
        if (zoneFactors != null) {
            m.put("zoneFactors", zoneFactors);
        }
        return m;
    }
}
