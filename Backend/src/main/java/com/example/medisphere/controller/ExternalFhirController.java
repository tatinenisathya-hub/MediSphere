package com.example.medisphere.controller;

import com.example.medisphere.service.ExternalFhirService;
import com.example.medisphere.service.ExternalFhirService.ExternalFhirResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fhir/external")
@CrossOrigin(origins = "http://localhost:5173")
public class ExternalFhirController {

    private final ExternalFhirService externalFhirService;

    public ExternalFhirController(
            ExternalFhirService externalFhirService) {

        this.externalFhirService =
                externalFhirService;
    }

    @PostMapping("/{resourceType}")
    public ResponseEntity<String> createResource(
            @PathVariable String resourceType,
            @RequestBody String fhirJson) {

        ExternalFhirResponse response =
                externalFhirService.createResource(
                        resourceType,
                        fhirJson
                );

        return ResponseEntity
                .status(response.statusCode())
                .body(response.body());
    }

    @PutMapping("/{resourceType}/{resourceId}")
    public ResponseEntity<String> updateResource(
            @PathVariable String resourceType,
            @PathVariable String resourceId,
            @RequestBody String fhirJson) {

        ExternalFhirResponse response =
                externalFhirService.updateResource(
                        resourceType,
                        resourceId,
                        fhirJson
                );

        return ResponseEntity
                .status(response.statusCode())
                .body(response.body());
    }

    @GetMapping("/{resourceType}/{resourceId}")
    public ResponseEntity<String> getResource(
            @PathVariable String resourceType,
            @PathVariable String resourceId) {

        ExternalFhirResponse response =
                externalFhirService.getResource(
                        resourceType,
                        resourceId
                );

        return ResponseEntity
                .status(response.statusCode())
                .body(response.body());
    }
}