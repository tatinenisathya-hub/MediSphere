package com.example.medisphere.controller;

import com.example.medisphere.service.FhirObservationService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fhir")
@CrossOrigin(origins = "http://localhost:5173")
public class FhirObservationController {

    private final FhirObservationService
            fhirObservationService;

    public FhirObservationController(
            FhirObservationService
                    fhirObservationService) {

        this.fhirObservationService =
                fhirObservationService;
    }

    /**
     * Converts MediSphere Vital
     * to FHIR R4 Observations.
     */
    @GetMapping(
            value = "/Observation/vital/{id}",
            produces = "application/fhir+json"
    )
    public ResponseEntity<String>
    getFhirObservation(
            @PathVariable String id) {

        try {

            String observations =
                    fhirObservationService
                            .getFhirObservations(id);

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    "application/fhir+json"
                            )
                    )
                    .body(observations);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}