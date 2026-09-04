package com.example.medisphere.controller;

import com.example.medisphere.service
        .FhirMedicationRequestService;

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
public class FhirMedicationRequestController {

    private final FhirMedicationRequestService
            fhirMedicationRequestService;

    public FhirMedicationRequestController(
            FhirMedicationRequestService
                    fhirMedicationRequestService) {

        this.fhirMedicationRequestService =
                fhirMedicationRequestService;
    }

    /**
     * Converts MediSphere Prescription
     * to FHIR R4 MedicationRequest.
     */
    @GetMapping(
            value = "/MedicationRequest/{id}",
            produces = "application/fhir+json"
    )
    public ResponseEntity<String>
    getFhirMedicationRequest(
            @PathVariable String id) {

        try {

            String medicationRequest =
                    fhirMedicationRequestService
                            .getFhirMedicationRequest(id);

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    "application/fhir+json"
                            )
                    )
                    .body(medicationRequest);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}