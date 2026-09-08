package com.example.medisphere.controller;

import com.example.medisphere.model.Patient360Response;
import com.example.medisphere.service.Patient360Service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patient-360")
@CrossOrigin(origins = "http://localhost:5173")
public class Patient360Controller {

    private final Patient360Service patient360Service;

    public Patient360Controller(
            Patient360Service patient360Service) {

        this.patient360Service =
                patient360Service;
    }


    @GetMapping("/{patientId}")
    public ResponseEntity<Patient360Response>
    getPatient360(
            @PathVariable String patientId) {

        try {

            Patient360Response response =
                    patient360Service
                            .getPatient360(patientId);

            return ResponseEntity.ok(response);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}