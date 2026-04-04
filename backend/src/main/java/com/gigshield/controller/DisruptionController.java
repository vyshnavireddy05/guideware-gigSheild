package com.gigshield.controller;

import com.gigshield.dto.MockDisruptionRequest;
import com.gigshield.service.DisruptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disruptions")
@RequiredArgsConstructor
public class DisruptionController {

    private final DisruptionService disruptionService;

    @GetMapping("/active/{city}")
    public ResponseEntity<List<Map<String, Object>>> active(@PathVariable String city) {
        return ResponseEntity.ok(disruptionService.activeInCity(city));
    }

    @PostMapping("/mock-trigger")
    public ResponseEntity<Map<String, Object>> mockTrigger(@Valid @RequestBody MockDisruptionRequest req) {
        return ResponseEntity.ok(disruptionService.mockTrigger(req));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> all() {
        return ResponseEntity.ok(disruptionService.all());
    }
}
