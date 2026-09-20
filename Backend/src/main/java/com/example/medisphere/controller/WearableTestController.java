package com.example.medisphere.controller;

import com.example.medisphere.model.WearableReadingRequest;
import com.example.medisphere.model.Vital;
import com.example.medisphere.service.WearableService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wearables")
@CrossOrigin(origins = "http://localhost:5173")
public class WearableTestController {

    private final WearableService wearableService;

    public WearableTestController(WearableService wearableService) {
        this.wearableService = wearableService;
    }

    @PostMapping("/test-event")
    public ResponseEntity<Vital> testWearableEvent(
            @RequestBody WearableReadingRequest request) {

        Vital savedVital = wearableService.ingestReading(request);

        return ResponseEntity.ok(savedVital);
    }
}