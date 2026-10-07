package com.example.medisphere.repository;

import com.example.medisphere.model.Consent;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConsentRepository
        extends MongoRepository<Consent, String> {

    List<Consent> findByPatientId(String patientId);

    List<Consent> findByPatientIdAndConsentTypeAndStatus(
            String patientId,
            String consentType,
            String status
    );
}