package com.example.medisphere.repository;

import com.example.medisphere.model.AiRiskHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AiRiskHistoryRepository
        extends MongoRepository<AiRiskHistory, String> {

    List<AiRiskHistory> findTop2ByPatientIdAndModelTypeOrderByPredictionDateDesc(
            String patientId,
            String modelType
    );
}