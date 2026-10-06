package com.example.medisphere.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.medisphere.model.User;
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

    // =========================================================
    // GET ALL ALERTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<VitalAlert>> getAllAlerts(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                vitalAlertService.getAllAlerts(user)
        );
    }

    // =========================================================
    // GET ALERTS BY PATIENT
    // =========================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VitalAlert>> getAlertsByPatientId(
            @PathVariable String patientId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                vitalAlertService.getAlertsByPatientId(
                        patientId,
                        user
                )
        );
    }

    // =========================================================
    // GET OPEN ALERTS
    // =========================================================

    @GetMapping("/open")
    public ResponseEntity<List<VitalAlert>> getOpenAlerts(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                vitalAlertService.getOpenAlerts(user)
        );
    }

    // =========================================================
    // UPDATE ALERT STATUS
    // =========================================================

    @PatchMapping("/{alertId}/status")
    public ResponseEntity<VitalAlert> updateAlertStatus(
            @PathVariable String alertId,
            @RequestParam String status,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        VitalAlert updatedAlert =
                vitalAlertService.updateAlertStatus(
                        alertId,
                        status,
                        user
                );

        if (updatedAlert == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }

        return ResponseEntity.ok(updatedAlert);
    }
}