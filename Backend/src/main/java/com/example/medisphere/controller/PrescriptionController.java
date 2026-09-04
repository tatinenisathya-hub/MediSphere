package com.example.medisphere.controller;

import com.example.medisphere.model.Prescription;
import com.example.medisphere.service.PrescriptionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(
            PrescriptionService prescriptionService) {

        this.prescriptionService = prescriptionService;
    }

    // Create prescription
    @PostMapping
    public Prescription createPrescription(
            @RequestBody Prescription prescription) {

        return prescriptionService.addPrescription(
                prescription
        );
    }

    // Get all prescriptions
    @GetMapping
    public List<Prescription> getAllPrescriptions() {

        return prescriptionService
                .getAllPrescriptions();
    }

    // Get prescriptions by patient ID
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>>
    getPrescriptionsByPatient(

            @PathVariable String patientId) {

        return ResponseEntity.ok(
                prescriptionService
                        .getPrescriptionsByPatientId(
                                patientId
                        )
        );
    }

    // Get prescription by ID
    @GetMapping("/{id}")
    public ResponseEntity<Prescription>
    getPrescriptionById(

            @PathVariable String id) {

        return prescriptionService
                .getPrescriptionById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // Update prescription
    @PutMapping("/{id}")
    public ResponseEntity<Prescription>
    updatePrescription(

            @PathVariable String id,
            @RequestBody Prescription prescription) {

        Prescription updatedPrescription =
                prescriptionService.updatePrescription(
                        id,
                        prescription
                );

        if (updatedPrescription == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                updatedPrescription
        );
    }

    // Delete prescription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(
            @PathVariable String id) {

        boolean deleted =
                prescriptionService
                        .deletePrescription(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}