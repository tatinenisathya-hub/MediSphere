package com.example.medisphere.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiRiskController {

    private final AiRiskService aiRiskService;

    public AiRiskController(
            AiRiskService aiRiskService) {

        this.aiRiskService = aiRiskService;
    }

    // -----------------------------------------------------
    // Cardiovascular prediction
    // -----------------------------------------------------

    @PostMapping("/cardiovascular/predict")
    public ResponseEntity<?> predictCardiovascularRisk(
            @RequestBody CardiovascularRiskRequest request) {

        try {

            CardiovascularRiskResponse response =
                    aiRiskService.predictCardiovascularRisk(
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalStateException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            java.util.Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }

    // -----------------------------------------------------
    // Diabetes prediction
    // -----------------------------------------------------

    @PostMapping("/diabetes/predict")
    public ResponseEntity<?> predictDiabetesRisk(
            @RequestBody DiabetesRiskRequest request) {

        try {

            DiabetesRiskResponse response =
                    aiRiskService.predictDiabetesRisk(
                            request
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalStateException exception) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            java.util.Map.of(
                                    "error",
                                    exception.getMessage()
                            )
                    );
        }
    }
}