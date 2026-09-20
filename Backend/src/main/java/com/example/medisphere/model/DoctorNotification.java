package com.example.medisphere.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_notifications")
public class DoctorNotification {

    @Id
    private String id;

    private String notificationId;
    private String alertId;
    private String patientId;
    private String vitalType;
    private Double measuredValue;
    private String unit;
    private String severity;
    private String message;
    private LocalDateTime recordedAt;
    private LocalDateTime createdAt;
    private LocalDateTime receivedAt;
    private String status;
}