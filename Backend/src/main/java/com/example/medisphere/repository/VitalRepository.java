package com.example.medisphere.repository;

import com.example.medisphere.model.Vital;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VitalRepository
        extends MongoRepository<Vital, String> {

    List<Vital> findByPatientId(String patientId);

    Optional<Vital> findByEventId(String eventId);

    // New method for patient-specific monitoring
    List<Vital> findByPatientIdOrderByRecordedAtDesc(String patientId);
}