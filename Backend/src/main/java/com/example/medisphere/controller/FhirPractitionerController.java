package com.example.medisphere.controller;

import com.example.medisphere.service.FhirPractitionerService;

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
public class FhirPractitionerController {

    private final FhirPractitionerService fhirPractitionerService;

    public FhirPractitionerController(
            FhirPractitionerService fhirPractitionerService) {

        this.fhirPractitionerService = fhirPractitionerService;
    }

    /**
     * Returns one MediSphere doctor
     * as a FHIR R4 Practitioner resource.
     */
    @GetMapping(
            value = "/Practitioner/{id}",
            produces = "application/fhir+json"
    )
    public ResponseEntity<String> getFhirPractitioner(
            @PathVariable String id) {

        try {

            String fhirPractitioner =
                    fhirPractitionerService.getFhirPractitioner(id);

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    "application/fhir+json"
                            )
                    )
                    .body(fhirPractitioner);

        } catch (RuntimeException error) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}