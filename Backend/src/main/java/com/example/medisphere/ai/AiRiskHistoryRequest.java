package com.example.medisphere.ai;

public class AiRiskHistoryRequest {

    private String patientId;
    private String modelType;
    private String modelVersion;
    private Double riskProbability;
    private String riskBand;
    private Double modelAccuracy;

    public AiRiskHistoryRequest() {
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public Double getRiskProbability() {
        return riskProbability;
    }

    public void setRiskProbability(Double riskProbability) {
        this.riskProbability = riskProbability;
    }

    public String getRiskBand() {
        return riskBand;
    }

    public void setRiskBand(String riskBand) {
        this.riskBand = riskBand;
    }

    public Double getModelAccuracy() {
        return modelAccuracy;
    }

    public void setModelAccuracy(Double modelAccuracy) {
        this.modelAccuracy = modelAccuracy;
    }
}