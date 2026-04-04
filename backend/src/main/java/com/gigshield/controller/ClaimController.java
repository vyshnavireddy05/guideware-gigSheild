package com.gigshield.controller;

import com.gigshield.dto.ProcessClaimRequest;
import com.gigshield.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Map<String, Object>>> my(@PathVariable Long userId) {
        return ResponseEntity.ok(claimService.myClaims(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> all() {
        return ResponseEntity.ok(claimService.allClaims());
    }

    @PostMapping("/process/{claimId}")
    public ResponseEntity<Map<String, Object>> process(
            @PathVariable Long claimId,
            @Valid @RequestBody ProcessClaimRequest req
    ) {
        return ResponseEntity.ok(claimService.processClaim(claimId, req));
    }
}
