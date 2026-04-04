package com.gigshield.controller;

import com.gigshield.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/worker/{userId}")
    public ResponseEntity<Map<String, Object>> worker(@PathVariable Long userId) {
        return ResponseEntity.ok(dashboardService.worker(userId));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> admin() {
        return ResponseEntity.ok(dashboardService.admin());
    }
}
