package com.example.medisphere.service;

import com.example.medisphere.model.Consent;
import com.example.medisphere.model.Patient;
import com.example.medisphere.repository.ConsentRepository;
import com.example.medisphere.repository.PatientRepository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ConsentService {

    private final ConsentRepository consentRepository;
    private final PatientRepository patientRepository;

    public ConsentService(
            ConsentRepository consentRepository,
            PatientRepository patientRepository) {

        this.consentRepository = consentRepository;
        this.patientRepository = patientRepository;
    }


    // Grant consent
    public Consent grantConsent(Consent consent) {

        Patient patient = patientRepository
                .findById(consent.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: "
                                        + consent.getPatientId()
                        )
                );

        consent.setStatus("ACTIVE");
        consent.setGrantedAt(LocalDateTime.now());
        consent.setRevokedAt(null);

        return consentRepository.save(consent);
    }


    // Get all patient consents
    public List<Consent> getPatientConsents(
            String patientId) {

        return consentRepository
                .findByPatientId(patientId);
    }


    // Revoke consent
    public Consent revokeConsent(String consentId) {

        Consent consent = consentRepository
                .findById(consentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Consent not found with ID: "
                                        + consentId
                        )
                );

        consent.setStatus("REVOKED");
        consent.setRevokedAt(LocalDateTime.now());

        return consentRepository.save(consent);
    }


    // Check active consent
    public boolean hasActiveConsent(
            String patientId,
            String consentType) {

        return consentRepository
                .findByPatientIdAndConsentTypeAndStatus(
                        patientId,
                        consentType,
                        "ACTIVE"
                )
                .isPresent();
    }
}