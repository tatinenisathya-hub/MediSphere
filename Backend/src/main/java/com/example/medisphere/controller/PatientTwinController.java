package com.example.medisphere.controller;

import com.example.medisphere.model.PatientTwin;
import com.example.medisphere.service.PatientTwinService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient-twins")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientTwinController {

    private final PatientTwinService patientTwinService;

    public PatientTwinController(
            PatientTwinService patientTwinService) {

        this.patientTwinService =
                patientTwinService;
    }

    // =====================================
    // CREATE PATIENT TWIN
    // =====================================

    @PostMapping
    public ResponseEntity<PatientTwin>
    createPatientTwin(
            @RequestBody PatientTwin patientTwin) {

        PatientTwin createdTwin =
                patientTwinService
                        .createPatientTwin(patientTwin);

        return new ResponseEntity<>(
                createdTwin,
                HttpStatus.CREATED
        );
    }

    // =====================================
    // GET ALL PATIENT TWINS
    // =====================================

    @GetMapping
    public List<PatientTwin>
    getAllPatientTwins() {

        return patientTwinService
                .getAllPatientTwins();
    }

    // =====================================
    // GET PATIENT TWIN BY TWIN ID
    // =====================================

    @GetMapping("/{id}")
    public PatientTwin
    getPatientTwinById(
            @PathVariable String id) {

        return patientTwinService
                .getPatientTwinById(id);
    }

    // =====================================
    // GET PATIENT TWIN BY PATIENT ID
    // =====================================

    @GetMapping("/patient/{patientId}")
    public PatientTwin
    getPatientTwinByPatientId(
            @PathVariable String patientId) {

        return patientTwinService
                .getPatientTwinByPatientId(
                        patientId
                );
    }

    // =====================================
    // GENERATE DIGITAL TWIN
    // =====================================

    @PostMapping("/generate/{patientId}")
    public ResponseEntity<PatientTwin>
    generatePatientTwin(
            @PathVariable String patientId) {

        PatientTwin patientTwin =
                patientTwinService
                        .generatePatientTwin(
                                patientId
                        );

        return new ResponseEntity<>(
                patientTwin,
                HttpStatus.CREATED
        );
    }

    // =====================================
    // REFRESH DIGITAL TWIN
    // =====================================

    @PostMapping("/refresh/{patientId}")
    public PatientTwin
    refreshPatientTwin(
            @PathVariable String patientId) {

        return patientTwinService
                .refreshPatientTwin(
                        patientId
                );
    }

    // =====================================
    // UPDATE PATIENT TWIN
    // =====================================

    @PutMapping("/{id}")
    public PatientTwin
    updatePatientTwin(
            @PathVariable String id,
            @RequestBody PatientTwin patientTwin) {

        return patientTwinService
                .updatePatientTwin(
                        id,
                        patientTwin
                );
    }

    // =====================================
    // DELETE PATIENT TWIN
    // =====================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deletePatientTwin(
            @PathVariable String id) {

        patientTwinService
                .deletePatientTwin(id);

        return ResponseEntity.ok(
                "Patient Twin deleted successfully"
        );
    }
}