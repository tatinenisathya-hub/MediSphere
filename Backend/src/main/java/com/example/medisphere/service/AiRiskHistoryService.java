package com.example.medisphere.service;

import com.example.medisphere.ai.AiRiskHistoryRequest;
import com.example.medisphere.model.AiRiskHistory;
import com.example.medisphere.repository.AiRiskHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class AiRiskHistoryService {

    private final AiRiskHistoryRepository repository;

    public AiRiskHistoryService(
            AiRiskHistoryRepository repository
    ) {
        this.repository = repository;
    }

    public AiRiskHistory save(
            AiRiskHistoryRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "AI risk history request cannot be empty."
            );
        }

        if (request.getPatientId() == null
                || request.getPatientId().isBlank()) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        if (request.getModelType() == null
                || request.getModelType().isBlank()) {

            throw new IllegalArgumentException(
                    "AI model type is required."
            );
        }

        if (request.getRiskProbability() == null
                || request.getRiskProbability() < 0.0
                || request.getRiskProbability() > 1.0) {

            throw new IllegalArgumentException(
                    "Risk probability must be between 0 and 1."
            );
        }

        AiRiskHistory history =
                new AiRiskHistory();

        history.setPatientId(
                request.getPatientId().trim()
        );

        history.setModelType(
                request.getModelType()
                        .trim()
                        .toUpperCase(Locale.ROOT)
        );

        history.setModelVersion(
                request.getModelVersion()
        );

        history.setRiskProbability(
                request.getRiskProbability()
        );

        history.setRiskBand(
                request.getRiskBand()
        );

        history.setModelAccuracy(
                request.getModelAccuracy()
        );

        history.setPredictionDate(
                LocalDateTime.now()
        );

        return repository.save(history);
    }

    public List<AiRiskHistory> getRecentHistory(
            String patientId,
            String modelType
    ) {

        if (patientId == null
                || patientId.isBlank()) {

            return List.of();
        }

        return repository
                .findTop2ByPatientIdAndModelTypeOrderByPredictionDateDesc(
                        patientId,
                        modelType.toUpperCase(Locale.ROOT)
                );
    }
}