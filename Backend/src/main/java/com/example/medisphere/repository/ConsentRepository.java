package com.example.medisphere.repository;

import com.example.medisphere.model.Consent;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConsentRepository
        extends MongoRepository<Consent, String> {

    List<Consent> findByPatientId(String patientId);

    Optional<Consent> findByPatientIdAndConsentTypeAndStatus(
            String patientId,
            String consentType,
            String status
    );
}