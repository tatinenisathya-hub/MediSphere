package com.example.medisphere.controller;

import com.example.medisphere.service.FhirPatientService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fhir")
@CrossOrigin(origins = "http://localhost:5173")
public class FhirPatientController {

    private final FhirPatientService fhirPatientService;

    public FhirPatientController(
            FhirPatientService fhirPatientService) {

        this.fhirPatientService = fhirPatientService;
    }

    /**
     * Returns one MediSphere patient
     * as a FHIR R4 Patient resource.
     */
    @GetMapping(
            value = "/Patient/{id}",
            produces = "application/fhir+json"
    )
    public ResponseEntity<String> getFhirPatient(
            @PathVariable String id) {

        try {

            String fhirPatient =
                    fhirPatientService.getFhirPatient(id);

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    "application/fhir+json"
                            )
                    )
                    .body(fhirPatient);

        } catch (RuntimeException error) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}