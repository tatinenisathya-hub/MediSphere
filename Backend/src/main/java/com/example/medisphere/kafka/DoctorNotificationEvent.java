package com.example.medisphere.kafka;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorNotificationEvent {

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

    private String status;
}