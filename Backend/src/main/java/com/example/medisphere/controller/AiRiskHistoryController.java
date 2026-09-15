package com.example.medisphere.controller;

import com.example.medisphere.ai.AiRiskHistoryRequest;
import com.example.medisphere.model.AiRiskHistory;
import com.example.medisphere.service.AiRiskHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiRiskHistoryController {

    private final AiRiskHistoryService historyService;

    public AiRiskHistoryController(
            AiRiskHistoryService historyService
    ) {
        this.historyService = historyService;
    }

    // =========================================================
    // Save AI prediction history
    // =========================================================

    @PostMapping("/history")
    public ResponseEntity<?> saveRiskHistory(
            @RequestBody AiRiskHistoryRequest request
    ) {

        try {

            AiRiskHistory saved =
                    historyService.save(request);

            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // Get latest two AI predictions for a patient
    // =========================================================

    @GetMapping("/risk-history/{patientId}")
    public ResponseEntity<?> getRiskHistory(
            @PathVariable String patientId
    ) {

        try {

            return ResponseEntity.ok(
                    Map.of(
                            "cardiovascular",
                            historyService.getRecentHistory(
                                    patientId,
                                    "CARDIOVASCULAR"
                            ),

                            "diabetes",
                            historyService.getRecentHistory(
                                    patientId,
                                    "DIABETES"
                            )
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "error",
                                    "Unable to load AI risk history."
                            )
                    );
        }
    }
}