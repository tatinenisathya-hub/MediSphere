package com.example.medisphere.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiModelStatusController {

    private final AiModelStatusService aiModelStatusService;

    public AiModelStatusController(
            AiModelStatusService aiModelStatusService) {

        this.aiModelStatusService = aiModelStatusService;
    }

    // -----------------------------------------------------
    // AI model status
    // -----------------------------------------------------

    @GetMapping("/models")
    public ResponseEntity<?> getModelStatus() {

        try {

            Object response =
                    aiModelStatusService.getModelStatus();

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
    // AI service health
    // -----------------------------------------------------

    @GetMapping("/health")
    public ResponseEntity<?> getAiHealth() {

        try {

            Object response =
                    aiModelStatusService.getAiHealth();

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