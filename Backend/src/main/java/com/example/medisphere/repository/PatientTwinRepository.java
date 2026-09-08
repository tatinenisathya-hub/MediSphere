package com.example.medisphere.repository;

import com.example.medisphere.model.PatientTwin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PatientTwinRepository
        extends MongoRepository<PatientTwin, String> {

    Optional<PatientTwin> findByPatientId(String patientId);
}