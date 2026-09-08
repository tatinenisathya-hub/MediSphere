package com.example.medisphere.kafka;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class WearableVitalEvent {

    private String eventId;

    private String deviceId;

    private String patientId;

    private String deviceType;

    private Double heartRate;

    private Double temperature;

    private Double systolicBloodPressure;

    private Double diastolicBloodPressure;

    private Double oxygenSaturation;

    private Double respiratoryRate;

    private LocalDateTime recordedAt;
}