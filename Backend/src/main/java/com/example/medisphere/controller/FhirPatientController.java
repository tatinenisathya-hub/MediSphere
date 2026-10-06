package com.example.medisphere.controller;

import com.example.medisphere.model.User;
import com.example.medisphere.service.FhirPatientService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            @PathVariable String id,
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();

        try {
            String fhirPatient =
                    fhirPatientService.getFhirPatient(id, user);

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    "application/fhir+json"
                            )
                    )
                    .body(fhirPatient);

        } catch (SecurityException error) {
            return ResponseEntity.status(403).build();

        } catch (RuntimeException error) {
            return ResponseEntity.notFound().build();
        }
    }
}