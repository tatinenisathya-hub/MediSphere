package com.example.medisphere.controller;

import com.example.medisphere.service.CarePlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/care-plans")
@CrossOrigin(origins = "http://localhost:5173")
public class CarePlanController {
    private final CarePlanService service;
    public CarePlanController(CarePlanService service) { this.service = service; }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestParam String patientId) {
        try { return ResponseEntity.ok(service.generate(patientId)); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatient(@PathVariable String patientId) {
        try { return ResponseEntity.ok(service.getByPatient(patientId)); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/{planId}")
    public ResponseEntity<?> get(@PathVariable String planId) {
        try { return ResponseEntity.ok(service.get(planId)); }
        catch (IllegalArgumentException e) { return ResponseEntity.notFound().build(); }
    }

    @PatchMapping("/{planId}/items/{itemId}/adherence")
    public ResponseEntity<?> adherence(@PathVariable String planId, @PathVariable String itemId, @RequestBody Map<String, String> body) {
        try { return ResponseEntity.ok(service.updateAdherence(planId, itemId, body.get("status"), body.get("notes"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/{planId}/outcomes")
    public ResponseEntity<?> outcome(@PathVariable String planId, @RequestBody Map<String, Object> body) {
        try {
            String metric = body.get("metric") == null ? null : body.get("metric").toString();
            Double value = body.get("value") == null ? null : Double.valueOf(body.get("value").toString());
            String unit = body.get("unit") == null ? null : body.get("unit").toString();
            String notes = body.get("notes") == null ? null : body.get("notes").toString();
            LocalDateTime recordedAt = body.get("recordedAt") == null ? null : LocalDateTime.parse(body.get("recordedAt").toString());
            return ResponseEntity.ok(service.addOutcome(planId, metric, value, unit, notes, recordedAt));
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() == null ? "Invalid outcome." : e.getMessage()));
        }
    }

    @PatchMapping("/{planId}/approval")
    public ResponseEntity<?> approve(@PathVariable String planId, @RequestBody Map<String, String> body) {
        try { return ResponseEntity.ok(service.approve(planId, body.get("approvedBy"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
