package com.example.medisphere.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.medisphere.model.Vital;
import com.example.medisphere.model.WearableDevice;
import com.example.medisphere.model.WearableReadingRequest;
import com.example.medisphere.service.WearableService;

@RestController
@RequestMapping("/api/wearables")
@CrossOrigin(origins = "http://localhost:5173")
public class WearableController {

    private final WearableService wearableService;

    public WearableController(WearableService wearableService) {
        this.wearableService = wearableService;
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connectDevice(@RequestBody WearableDevice device) {
        try {
            return ResponseEntity.ok(wearableService.connectDevice(device));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<WearableDevice>> getPatientDevices(@PathVariable String patientId) {
        return ResponseEntity.ok(wearableService.getDevicesByPatient(patientId));
    }

    @PutMapping("/{deviceId}/disconnect")
    public ResponseEntity<?> disconnectDevice(@PathVariable String deviceId) {
        try {
            return ResponseEntity.ok(wearableService.disconnectDevice(deviceId));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/readings")
    public ResponseEntity<?> ingestReading(@RequestBody WearableReadingRequest request) {
        try {
            Vital savedVital = wearableService.ingestReading(request);
            return ResponseEntity.ok(savedVital);
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }
}