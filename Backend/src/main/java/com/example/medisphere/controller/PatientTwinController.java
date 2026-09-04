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

        this.patientTwinService = patientTwinService;
    }

    @PostMapping
    public ResponseEntity<PatientTwin> createPatientTwin(
            @RequestBody PatientTwin patientTwin) {

        PatientTwin createdTwin =
                patientTwinService.createPatientTwin(patientTwin);

        return new ResponseEntity<>(
                createdTwin,
                HttpStatus.CREATED);
    }

    @GetMapping
    public List<PatientTwin> getAllPatientTwins() {

        return patientTwinService.getAllPatientTwins();
    }

    @GetMapping("/{id}")
    public PatientTwin getPatientTwinById(
            @PathVariable String id) {

        return patientTwinService.getPatientTwinById(id);
    }

    @GetMapping("/patient/{patientId}")
    public PatientTwin getPatientTwinByPatientId(
            @PathVariable String patientId) {

        return patientTwinService
                .getPatientTwinByPatientId(patientId);
    }

    @PutMapping("/{id}")
    public PatientTwin updatePatientTwin(
            @PathVariable String id,
            @RequestBody PatientTwin patientTwin) {

        return patientTwinService
                .updatePatientTwin(id, patientTwin);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatientTwin(
            @PathVariable String id) {

        patientTwinService.deletePatientTwin(id);

        return ResponseEntity.ok(
                "Patient Twin deleted successfully");
    }
}