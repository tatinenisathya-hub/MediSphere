package com.example.medisphere.controller;

import com.example.medisphere.service.FhirAppointmentService;

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
public class FhirAppointmentController {

    private final FhirAppointmentService fhirAppointmentService;

    public FhirAppointmentController(
            FhirAppointmentService fhirAppointmentService) {

        this.fhirAppointmentService =
                fhirAppointmentService;
    }

    /**
     * Converts MediSphere Appointment
     * to FHIR R4 Appointment.
     */
    @GetMapping(
            value = "/Appointment/{id}",
            produces = "application/fhir+json"
    )
    public ResponseEntity<String> getFhirAppointment(
            @PathVariable String id) {

        try {

            String appointment =
                    fhirAppointmentService
                            .getFhirAppointment(id);

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    "application/fhir+json"
                            )
                    )
                    .body(appointment);

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}