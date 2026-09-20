package com.example.medisphere.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.medisphere.kafka.DoctorNotificationEvent;
import com.example.medisphere.kafka.DoctorNotificationProducer;
import com.example.medisphere.model.Vital;
import com.example.medisphere.model.VitalAlert;
import com.example.medisphere.repository.VitalAlertRepository;

@Service
public class VitalAlertService {

    private final VitalAlertRepository vitalAlertRepository;

    private final DoctorNotificationProducer
            doctorNotificationProducer;

    public VitalAlertService(
            VitalAlertRepository vitalAlertRepository,
            DoctorNotificationProducer doctorNotificationProducer) {

        this.vitalAlertRepository = vitalAlertRepository;

        this.doctorNotificationProducer =
                doctorNotificationProducer;
    }

    // =========================================================
    // VITAL THRESHOLDS
    // =========================================================

    private static final double HEART_RATE_MIN = 50.0;
    private static final double HEART_RATE_MAX = 120.0;

    private static final double TEMPERATURE_MAX = 38.0;

    private static final double SYSTOLIC_BP_MIN = 90.0;
    private static final double SYSTOLIC_BP_MAX = 180.0;

    private static final double DIASTOLIC_BP_MIN = 60.0;
    private static final double DIASTOLIC_BP_MAX = 120.0;

    private static final double OXYGEN_SATURATION_MIN = 92.0;

    private static final double RESPIRATORY_RATE_MIN = 12.0;
    private static final double RESPIRATORY_RATE_MAX = 24.0;

    // =========================================================
    // EVALUATE VITALS AND CREATE ALERTS
    // =========================================================

    public void evaluateVital(Vital vital) {

        if (vital == null) {
            return;
        }

        List<VitalAlert> alerts = new ArrayList<>();

        String patientId = vital.getPatientId();
        String vitalId = vital.getId();
        String deviceId = vital.getDeviceId();

        LocalDateTime recordedAt = vital.getRecordedAt();

        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }

        // -----------------------------------------------------
        // HEART RATE
        // -----------------------------------------------------

        if (vital.getHeartRate() != null) {

            double heartRate = vital.getHeartRate();

            if (heartRate < HEART_RATE_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "HEART_RATE",
                        heartRate,
                        "BPM",
                        "HIGH",
                        "Heart rate is below the configured threshold",
                        recordedAt
                ));

            } else if (heartRate > HEART_RATE_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "HEART_RATE",
                        heartRate,
                        "BPM",
                        "HIGH",
                        "Heart rate is above the configured threshold",
                        recordedAt
                ));
            }
        }

        // -----------------------------------------------------
        // TEMPERATURE
        // -----------------------------------------------------

        if (vital.getTemperature() != null) {

            double temperature = vital.getTemperature();

            if (temperature > TEMPERATURE_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "TEMPERATURE",
                        temperature,
                        "°C",
                        "MEDIUM",
                        "Temperature is above the configured threshold",
                        recordedAt
                ));
            }
        }

        // -----------------------------------------------------
        // SYSTOLIC BLOOD PRESSURE
        // -----------------------------------------------------

        if (vital.getSystolicBloodPressure() != null) {

            double systolicBP =
                    vital.getSystolicBloodPressure();

            if (systolicBP < SYSTOLIC_BP_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "SYSTOLIC_BLOOD_PRESSURE",
                        systolicBP,
                        "mmHg",
                        "HIGH",
                        "Systolic blood pressure is below the configured threshold",
                        recordedAt
                ));

            } else if (systolicBP > SYSTOLIC_BP_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "SYSTOLIC_BLOOD_PRESSURE",
                        systolicBP,
                        "mmHg",
                        "HIGH",
                        "Systolic blood pressure is above the configured threshold",
                        recordedAt
                ));
            }
        }

        // -----------------------------------------------------
        // DIASTOLIC BLOOD PRESSURE
        // -----------------------------------------------------

        if (vital.getDiastolicBloodPressure() != null) {

            double diastolicBP =
                    vital.getDiastolicBloodPressure();

            if (diastolicBP < DIASTOLIC_BP_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "DIASTOLIC_BLOOD_PRESSURE",
                        diastolicBP,
                        "mmHg",
                        "HIGH",
                        "Diastolic blood pressure is below the configured threshold",
                        recordedAt
                ));

            } else if (diastolicBP > DIASTOLIC_BP_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "DIASTOLIC_BLOOD_PRESSURE",
                        diastolicBP,
                        "mmHg",
                        "HIGH",
                        "Diastolic blood pressure is above the configured threshold",
                        recordedAt
                ));
            }
        }

        // -----------------------------------------------------
        // OXYGEN SATURATION
        // -----------------------------------------------------

        if (vital.getOxygenSaturation() != null) {

            double oxygenSaturation =
                    vital.getOxygenSaturation();

            if (oxygenSaturation < OXYGEN_SATURATION_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "OXYGEN_SATURATION",
                        oxygenSaturation,
                        "%",
                        "HIGH",
                        "Oxygen saturation is below the configured threshold",
                        recordedAt
                ));
            }
        }

        // -----------------------------------------------------
        // RESPIRATORY RATE
        // -----------------------------------------------------

        if (vital.getRespiratoryRate() != null) {

            double respiratoryRate =
                    vital.getRespiratoryRate();

            if (respiratoryRate < RESPIRATORY_RATE_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "RESPIRATORY_RATE",
                        respiratoryRate,
                        "breaths/min",
                        "MEDIUM",
                        "Respiratory rate is below the configured threshold",
                        recordedAt
                ));

            } else if (respiratoryRate > RESPIRATORY_RATE_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "RESPIRATORY_RATE",
                        respiratoryRate,
                        "breaths/min",
                        "MEDIUM",
                        "Respiratory rate is above the configured threshold",
                        recordedAt
                ));
            }
        }

        // =====================================================
        // SAVE ALL GENERATED ALERTS AND PUBLISH NOTIFICATIONS
        // =====================================================

        if (!alerts.isEmpty()) {

            List<VitalAlert> savedAlerts =
                    vitalAlertRepository.saveAll(alerts);

            for (VitalAlert alert : savedAlerts) {

                DoctorNotificationEvent event =
                        new DoctorNotificationEvent(

                                // notificationId
                                UUID.randomUUID().toString(),

                                // alertId
                                alert.getId(),

                                // patientId
                                alert.getPatientId(),

                                // vitalType
                                alert.getVitalType(),

                                // measuredValue
                                alert.getMeasuredValue(),

                                // unit
                                alert.getUnit(),

                                // severity
                                alert.getSeverity(),

                                // message
                                alert.getMessage(),

                                // recordedAt
                                alert.getRecordedAt(),

                                // createdAt
                                alert.getCreatedAt(),

                                // status
                                alert.getStatus()
                        );

                doctorNotificationProducer.publishNotification(
                        event
                );
            }

            System.out.println(
                    "Vital alert evaluation completed. "
                            + savedAlerts.size()
                            + " alert(s) created and notification(s) "
                            + "published for patient: "
                            + patientId
            );
        }
    }

    // =========================================================
    // CREATE ALERT OBJECT
    // =========================================================

    private VitalAlert createAlert(
            String patientId,
            String vitalId,
            String deviceId,
            String vitalType,
            Double measuredValue,
            String unit,
            String severity,
            String message,
            LocalDateTime recordedAt) {

        VitalAlert alert = new VitalAlert();

        alert.setPatientId(patientId);
        alert.setVitalId(vitalId);
        alert.setDeviceId(deviceId);
        alert.setVitalType(vitalType);
        alert.setMeasuredValue(measuredValue);
        alert.setUnit(unit);
        alert.setSeverity(severity);
        alert.setMessage(message);
        alert.setRecordedAt(recordedAt);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setStatus("OPEN");

        return alert;
    }

    // =========================================================
    // GET ALL ALERTS
    // =========================================================

    public List<VitalAlert> getAllAlerts() {

        return vitalAlertRepository
                .findAllByOrderByCreatedAtDesc();
    }

    // =========================================================
    // GET ALERTS BY PATIENT ID
    // =========================================================

    public List<VitalAlert> getAlertsByPatientId(
            String patientId) {

        if (patientId == null || patientId.isBlank()) {

            return new ArrayList<>();
        }

        return vitalAlertRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    // =========================================================
    // GET OPEN ALERTS
    // =========================================================

    public List<VitalAlert> getOpenAlerts() {

        return vitalAlertRepository
                .findByStatusOrderByCreatedAtDesc("OPEN");
    }

    // =========================================================
    // UPDATE ALERT STATUS
    // =========================================================

    public VitalAlert updateAlertStatus(
            String alertId,
            String status) {

        if (alertId == null || alertId.isBlank()) {

            throw new IllegalArgumentException(
                    "Alert ID cannot be empty"
            );
        }

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Alert status cannot be empty"
            );
        }

        String updatedStatus =
                status.trim().toUpperCase();

        if (!updatedStatus.equals("OPEN")
                && !updatedStatus.equals("ACKNOWLEDGED")
                && !updatedStatus.equals("RESOLVED")) {

            throw new IllegalArgumentException(
                    "Invalid status. Allowed values: "
                            + "OPEN, ACKNOWLEDGED, RESOLVED"
            );
        }

        VitalAlert alert = vitalAlertRepository
                .findById(alertId)
                .orElseThrow(() -> new RuntimeException(
                        "Alert not found with ID: " + alertId
                ));

        alert.setStatus(updatedStatus);

        VitalAlert updatedAlert =
                vitalAlertRepository.save(alert);

        System.out.println(
                "Alert status updated successfully. "
                        + "Alert ID: " + alertId
                        + ", Status: " + updatedStatus
        );

        return updatedAlert;
    }
}