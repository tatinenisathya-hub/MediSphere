package com.example.medisphere.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "vitals")
public class Vital {

    @Id
    private String id;

    private String patientId;

    private Double heartRate;

    private Double temperature;

    private Double systolicBloodPressure;

    private Double diastolicBloodPressure;

    private Double oxygenSaturation;

    private Double respiratoryRate;

    private LocalDateTime recordedAt;

    public Vital() {
    }

    public Vital(
            String patientId,
            Double heartRate,
            Double temperature,
            Double systolicBloodPressure,
            Double diastolicBloodPressure,
            Double oxygenSaturation,
            Double respiratoryRate,
            LocalDateTime recordedAt) {

        this.patientId = patientId;
        this.heartRate = heartRate;
        this.temperature = temperature;
        this.systolicBloodPressure = systolicBloodPressure;
        this.diastolicBloodPressure = diastolicBloodPressure;
        this.oxygenSaturation = oxygenSaturation;
        this.respiratoryRate = respiratoryRate;
        this.recordedAt = recordedAt;
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

    public Double getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Double heartRate) {
        this.heartRate = heartRate;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getSystolicBloodPressure() {
        return systolicBloodPressure;
    }

    public void setSystolicBloodPressure(Double systolicBloodPressure) {
        this.systolicBloodPressure = systolicBloodPressure;
    }

    public Double getDiastolicBloodPressure() {
        return diastolicBloodPressure;
    }

    public void setDiastolicBloodPressure(Double diastolicBloodPressure) {
        this.diastolicBloodPressure = diastolicBloodPressure;
    }

    public Double getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(Double oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public Double getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Double respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}