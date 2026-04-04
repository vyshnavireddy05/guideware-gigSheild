package com.gigshield.controller;

import com.gigshield.service.PayoutQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutQueryService payoutQueryService;

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Map<String, Object>>> my(@PathVariable Long userId) {
        return ResponseEntity.ok(payoutQueryService.myPayouts(userId));
    }
}
