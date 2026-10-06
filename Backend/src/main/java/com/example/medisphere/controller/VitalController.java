package com.example.medisphere.controller;

import com.example.medisphere.model.User;
import com.example.medisphere.model.Vital;
import com.example.medisphere.service.VitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vitals")
@CrossOrigin(origins = "http://localhost:5173")
public class VitalController {

    private final VitalService vitalService;

    public VitalController(VitalService vitalService) {
        this.vitalService = vitalService;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<Vital> createVital(
            @RequestBody Vital vital,
            Authentication authentication
    ) {

        User user = getUser(authentication);

        Vital savedVital =
                vitalService.createVital(vital, user);

        return ResponseEntity.ok(savedVital);
    }

    // =========================================================
    // GET ALL
    // ADMIN ONLY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Vital>> getAllVitals(
            Authentication authentication
    ) {

        User user = getUser(authentication);

        return ResponseEntity.ok(
                vitalService.getAllVitals(user)
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getVitalById(
            @PathVariable String id,
            Authentication authentication
    ) {

        User user = getUser(authentication);

        Optional<Vital> vital =
                vitalService.getVitalById(id, user);

        if (vital.isPresent()) {
            return ResponseEntity.ok(vital.get());
        }

        return ResponseEntity.notFound().build();
    }

    // =========================================================
    // GET BY PATIENT
    // =========================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Vital>> getVitalsByPatient(
            @PathVariable String patientId,
            Authentication authentication
    ) {

        User user = getUser(authentication);

        return ResponseEntity.ok(
                vitalService.getVitalsByPatientId(
                        patientId,
                        user
                )
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVital(
            @PathVariable String id,
            @RequestBody Vital vital,
            Authentication authentication
    ) {

        User user = getUser(authentication);

        Vital updatedVital =
                vitalService.updateVital(
                        id,
                        vital,
                        user
                );

        if (updatedVital == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedVital);
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVital(
            @PathVariable String id,
            Authentication authentication
    ) {

        User user = getUser(authentication);

        boolean deleted =
                vitalService.deleteVital(id, user);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private User getUser(
            Authentication authentication
    ) {

        if (authentication == null
                || !(authentication.getPrincipal()
                instanceof User)) {

            throw new org.springframework.security.access
                    .AccessDeniedException(
                    "Authentication required"
            );
        }

        return (User) authentication.getPrincipal();
    }
}