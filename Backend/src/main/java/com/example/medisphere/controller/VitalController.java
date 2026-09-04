package com.example.medisphere.controller;

import com.example.medisphere.model.Vital;
import com.example.medisphere.service.VitalService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<Vital> createVital(
            @RequestBody Vital vital) {

        Vital savedVital = vitalService.createVital(vital);

        return ResponseEntity.ok(savedVital);
    }

    @GetMapping
    public ResponseEntity<List<Vital>> getAllVitals() {

        return ResponseEntity.ok(
                vitalService.getAllVitals()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVitalById(
            @PathVariable String id) {

        Optional<Vital> vital =
                vitalService.getVitalById(id);

        if (vital.isPresent()) {
            return ResponseEntity.ok(vital.get());
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Vital>> getVitalsByPatient(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                vitalService.getVitalsByPatientId(patientId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVital(
            @PathVariable String id,
            @RequestBody Vital vital) {

        Vital updatedVital =
                vitalService.updateVital(id, vital);

        if (updatedVital == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedVital);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVital(
            @PathVariable String id) {

        boolean deleted =
                vitalService.deleteVital(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                "Vital deleted successfully"
        );
    }
}