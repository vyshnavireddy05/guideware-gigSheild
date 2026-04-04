package com.gigshield.controller;

import com.gigshield.config.SecurityUtils;
import com.gigshield.dto.PurchasePolicyRequest;
import com.gigshield.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/policy")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping("/quote/{userId}")
    public ResponseEntity<Map<String, Object>> quote(@PathVariable Long userId) {
        SecurityUtils.requireWorkerOrAdmin(userId);
        return ResponseEntity.ok(policyService.quote(userId));
    }

    @PostMapping("/purchase")
    public ResponseEntity<Map<String, Object>> purchase(@Valid @RequestBody PurchasePolicyRequest body) {
        SecurityUtils.requireWorkerOrAdmin(body.getUserId());
        return ResponseEntity.ok(policyService.toMap(policyService.purchase(body.getUserId())));
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<Map<String, Object>> active(@PathVariable Long userId) {
        SecurityUtils.requireWorkerOrAdmin(userId);
        Map<String, Object> p = policyService.active(userId);
        if (p == null) {
            return ResponseEntity.ok(Map.of());
        }
        return ResponseEntity.ok(p);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> history(@PathVariable Long userId) {
        SecurityUtils.requireWorkerOrAdmin(userId);
        return ResponseEntity.ok(policyService.history(userId));
    }
}
