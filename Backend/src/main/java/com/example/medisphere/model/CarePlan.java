package com.example.medisphere.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "care_plans")
public class CarePlan {
    @Id
    private String id;
    private String patientId;
    private String patientName;
    private String status = "PENDING_REVIEW";
    private String generatedFrom = "AI_RISK_AND_GUIDELINE_RULES";
    private String clinicalDisclaimer = "Decision-support draft only. A qualified provider must review and approve this plan before clinical use.";
    private List<RiskReference> riskReferences = new ArrayList<>();
    private List<CarePlanItem> items = new ArrayList<>();
    private List<CarePlanOutcome> outcomes = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private String approvedBy;

    public CarePlan() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getGeneratedFrom() { return generatedFrom; }
    public void setGeneratedFrom(String generatedFrom) { this.generatedFrom = generatedFrom; }
    public String getClinicalDisclaimer() { return clinicalDisclaimer; }
    public void setClinicalDisclaimer(String clinicalDisclaimer) { this.clinicalDisclaimer = clinicalDisclaimer; }
    public List<RiskReference> getRiskReferences() { return riskReferences; }
    public void setRiskReferences(List<RiskReference> riskReferences) { this.riskReferences = riskReferences; }
    public List<CarePlanItem> getItems() { return items; }
    public void setItems(List<CarePlanItem> items) { this.items = items; }
    public List<CarePlanOutcome> getOutcomes() { return outcomes; }
    public void setOutcomes(List<CarePlanOutcome> outcomes) { this.outcomes = outcomes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public static class RiskReference {
        private String modelType;
        private String riskBand;
        private Double riskProbability;
        private LocalDateTime predictionDate;
        public RiskReference() {}
        public RiskReference(String modelType, String riskBand, Double riskProbability, LocalDateTime predictionDate) {
            this.modelType = modelType; this.riskBand = riskBand; this.riskProbability = riskProbability; this.predictionDate = predictionDate;
        }
        public String getModelType() { return modelType; }
        public void setModelType(String modelType) { this.modelType = modelType; }
        public String getRiskBand() { return riskBand; }
        public void setRiskBand(String riskBand) { this.riskBand = riskBand; }
        public Double getRiskProbability() { return riskProbability; }
        public void setRiskProbability(Double riskProbability) { this.riskProbability = riskProbability; }
        public LocalDateTime getPredictionDate() { return predictionDate; }
        public void setPredictionDate(LocalDateTime predictionDate) { this.predictionDate = predictionDate; }
    }

    public static class CarePlanItem {
        private String id = UUID.randomUUID().toString();
        private String category;
        private String title;
        private String description;
        private String frequency;
        private String status = "NOT_STARTED";
        private String adherenceNotes;
        private LocalDateTime lastUpdatedAt;
        public CarePlanItem() {}
        public CarePlanItem(String category, String title, String description, String frequency) {
            this.category = category; this.title = title; this.description = description; this.frequency = frequency;
        }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAdherenceNotes() { return adherenceNotes; }
        public void setAdherenceNotes(String adherenceNotes) { this.adherenceNotes = adherenceNotes; }
        public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
        public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
    }

    public static class CarePlanOutcome {
        private String id = UUID.randomUUID().toString();
        private String metric;
        private Double value;
        private String unit;
        private String notes;
        private LocalDateTime recordedAt;
        public CarePlanOutcome() {}
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getMetric() { return metric; }
        public void setMetric(String metric) { this.metric = metric; }
        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public LocalDateTime getRecordedAt() { return recordedAt; }
        public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
    }
}
