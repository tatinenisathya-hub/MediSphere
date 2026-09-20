package com.example.medisphere.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.medisphere.model.VitalAlert;
import com.example.medisphere.service.VitalAlertService;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class VitalAlertController {

    private final VitalAlertService vitalAlertService;

    public VitalAlertController(
            VitalAlertService vitalAlertService) {

        this.vitalAlertService = vitalAlertService;
    }

    @GetMapping
    public ResponseEntity<List<VitalAlert>> getAllAlerts() {

        return ResponseEntity.ok(
                vitalAlertService.getAllAlerts()
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VitalAlert>> getAlertsByPatientId(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                vitalAlertService.getAlertsByPatientId(patientId)
        );
    }

    @GetMapping("/open")
    public ResponseEntity<List<VitalAlert>> getOpenAlerts() {

        return ResponseEntity.ok(
                vitalAlertService.getOpenAlerts()
        );
    }

    @PatchMapping("/{alertId}/status")
    public ResponseEntity<VitalAlert> updateAlertStatus(
            @PathVariable String alertId,
            @RequestParam String status) {

        VitalAlert updatedAlert =
                vitalAlertService.updateAlertStatus(
                        alertId,
                        status
                );

        if (updatedAlert == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .build();
        }

        return ResponseEntity.ok(updatedAlert);
    }
}