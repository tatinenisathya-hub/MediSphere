package com.example.medisphere.controller;

import com.example.medisphere.model.Patient;
import com.example.medisphere.service.PatientService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {
    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // Create a new patient
    @PostMapping
public Patient createPatient(
        @Valid @RequestBody Patient patient) {

    return patientService.addPatient(patient);
}

    // Get all patients
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    // Get patient by ID
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(
            @PathVariable String id) {

        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update patient
    @PutMapping("/{id}")
public ResponseEntity<Patient> updatePatient(
        @PathVariable String id,
        @Valid @RequestBody Patient patient) {

    Patient updatedPatient =
            patientService.updatePatient(id, patient);

    if (updatedPatient == null) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(updatedPatient);
}

    // Delete patient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable String id) {

        boolean deleted = patientService.deletePatient(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}