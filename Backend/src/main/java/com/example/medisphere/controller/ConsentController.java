package com.example.medisphere.controller;

import com.example.medisphere.model.Consent;
import com.example.medisphere.service.ConsentService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consents")
@CrossOrigin(origins = "http://localhost:5173")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(
            ConsentService consentService) {

        this.consentService = consentService;
    }


    // Grant consent
    @PostMapping
    public ResponseEntity<Consent> grantConsent(
            @RequestBody Consent consent) {

        return ResponseEntity.ok(
                consentService.grantConsent(consent)
        );
    }


    // Get all consents for a patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Consent>>
    getPatientConsents(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                consentService
                        .getPatientConsents(patientId)
        );
    }


    // Revoke consent
    @PutMapping("/{consentId}/revoke")
    public ResponseEntity<Consent> revokeConsent(
            @PathVariable String consentId) {

        try {

            return ResponseEntity.ok(
                    consentService
                            .revokeConsent(consentId)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // Check active consent
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkConsent(
            @RequestParam String patientId,
            @RequestParam String consentType) {

        boolean active =
                consentService.hasActiveConsent(
                        patientId,
                        consentType
                );

        return ResponseEntity.ok(active);
    }
}