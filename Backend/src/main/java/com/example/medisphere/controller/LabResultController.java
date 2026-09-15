package com.example.medisphere.controller;

import com.example.medisphere.model.LabResult;
import com.example.medisphere.service.LabResultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory")
@CrossOrigin(origins = "http://localhost:5173")
public class LabResultController {

    private final LabResultService labResultService;

    public LabResultController(LabResultService labResultService) {
        this.labResultService = labResultService;
    }

    @PostMapping
    public ResponseEntity<LabResult> create(
            @RequestBody LabResult labResult
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(labResultService.create(labResult));
    }

    @GetMapping
    public ResponseEntity<List<LabResult>> getAll() {
        return ResponseEntity.ok(labResultService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResult> getById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(labResultService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabResult>> getByPatientId(
            @PathVariable String patientId
    ) {
        return ResponseEntity.ok(
                labResultService.getByPatientId(patientId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabResult> update(
            @PathVariable String id,
            @RequestBody LabResult labResult
    ) {
        return ResponseEntity.ok(
                labResultService.update(id, labResult)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id
    ) {
        labResultService.delete(id);
        return ResponseEntity.noContent().build();
    }
}