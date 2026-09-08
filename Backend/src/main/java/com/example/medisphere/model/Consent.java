package com.example.medisphere.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "consents")
public class Consent {

    @Id
    private String id;

    private String patientId;

    // Example: DATA_SHARING, FHIR_ACCESS, WEARABLE_DATA
    private String consentType;

    // Example: Research, Treatment, Healthcare Monitoring
    private String purpose;

    // ACTIVE or REVOKED
    private String status;

    private LocalDateTime grantedAt;

    private LocalDateTime revokedAt;

    public Consent() {
    }

    public Consent(
            String patientId,
            String consentType,
            String purpose) {

        this.patientId = patientId;
        this.consentType = consentType;
        this.purpose = purpose;

        this.status = "ACTIVE";
        this.grantedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getConsentType() {
        return consentType;
    }

    public void setConsentType(String consentType) {
        this.consentType = consentType;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}