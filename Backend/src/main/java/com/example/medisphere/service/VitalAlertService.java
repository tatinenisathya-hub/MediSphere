package com.example.medisphere.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.example.medisphere.kafka.DoctorNotificationEvent;
import com.example.medisphere.kafka.DoctorNotificationProducer;
import com.example.medisphere.model.Patient;
import com.example.medisphere.model.User;
import com.example.medisphere.model.Vital;
import com.example.medisphere.model.VitalAlert;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.VitalAlertRepository;

@Service
public class VitalAlertService {

    private final VitalAlertRepository vitalAlertRepository;
    private final PatientRepository patientRepository;
    private final DoctorNotificationProducer doctorNotificationProducer;

    public VitalAlertService(
            VitalAlertRepository vitalAlertRepository,
            PatientRepository patientRepository,
            DoctorNotificationProducer doctorNotificationProducer) {

        this.vitalAlertRepository = vitalAlertRepository;
        this.patientRepository = patientRepository;
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

            double systolic =
                    vital.getSystolicBloodPressure();

            if (systolic < SYSTOLIC_BP_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "SYSTOLIC_BP",
                        systolic,
                        "mmHg",
                        "HIGH",
                        "Systolic blood pressure is below the configured threshold",
                        recordedAt
                ));

            } else if (systolic > SYSTOLIC_BP_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "SYSTOLIC_BP",
                        systolic,
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

            double diastolic =
                    vital.getDiastolicBloodPressure();

            if (diastolic < DIASTOLIC_BP_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "DIASTOLIC_BP",
                        diastolic,
                        "mmHg",
                        "MEDIUM",
                        "Diastolic blood pressure is below the configured threshold",
                        recordedAt
                ));

            } else if (diastolic > DIASTOLIC_BP_MAX) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        vital.getDeviceId(),
                        "DIASTOLIC_BP",
                        diastolic,
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

            double oxygen =
                    vital.getOxygenSaturation();

            if (oxygen < OXYGEN_SATURATION_MIN) {

                alerts.add(createAlert(
                        patientId,
                        vitalId,
                        deviceId,
                        "OXYGEN_SATURATION",
                        oxygen,
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
        // SAVE GENERATED ALERTS + PUBLISH NOTIFICATIONS
        // =====================================================

        if (!alerts.isEmpty()) {

            // Save alerts first so MongoDB generates their IDs
            vitalAlertRepository.saveAll(alerts);

            // Publish a doctor notification for every alert
            for (VitalAlert alert : alerts) {

                DoctorNotificationEvent event =
                        new DoctorNotificationEvent();

                event.setNotificationId(
                        UUID.randomUUID().toString()
                );

                event.setAlertId(
                        alert.getId()
                );

                event.setPatientId(
                        alert.getPatientId()
                );

                event.setVitalType(
                        alert.getVitalType()
                );

                event.setMeasuredValue(
                        alert.getMeasuredValue()
                );

                event.setUnit(
                        alert.getUnit()
                );

                event.setSeverity(
                        alert.getSeverity()
                );

                event.setMessage(
                        alert.getMessage()
                );

                event.setRecordedAt(
                        alert.getRecordedAt()
                );

                event.setCreatedAt(
                        alert.getCreatedAt()
                );

                event.setStatus(
                        alert.getStatus()
                );

                doctorNotificationProducer
                        .publishNotification(event);
            }

            System.out.println(
                    "Vital alert evaluation completed. "
                            + alerts.size()
                            + " alert(s) created for patient: "
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

    public List<VitalAlert> getAllAlerts(User user) {

        // ADMIN can see everything
        if (user.getRole() == com.example.medisphere.model.Role.ADMIN) {

            return vitalAlertRepository
                    .findAllByOrderByCreatedAtDesc();
        }

        // PATIENT can only see their own alerts
        if (user.getRole() == com.example.medisphere.model.Role.PATIENT) {

            if (user.getPatientId() == null
                    || user.getPatientId().isBlank()) {

                return new ArrayList<>();
            }

            return vitalAlertRepository
                    .findByPatientIdOrderByCreatedAtDesc(
                            user.getPatientId()
                    );
        }

        // DOCTOR can see alerts belonging to assigned patients
        if (user.getRole() == com.example.medisphere.model.Role.DOCTOR) {

            if (user.getDoctorId() == null
                    || user.getDoctorId().isBlank()) {

                return new ArrayList<>();
            }

            List<String> assignedPatientIds =
                    patientRepository.findAll()
                            .stream()
                            .filter(patient ->
                                    user.getDoctorId()
                                            .equals(patient.getDoctorId()))
                            .map(Patient::getId)
                            .filter(id ->
                                    id != null && !id.isBlank())
                            .collect(Collectors.toList());

            if (assignedPatientIds.isEmpty()) {
                return new ArrayList<>();
            }

            return vitalAlertRepository
                    .findAllByOrderByCreatedAtDesc()
                    .stream()
                    .filter(alert ->
                            assignedPatientIds.contains(
                                    alert.getPatientId()))
                    .collect(Collectors.toList());
        }

        throw new AccessDeniedException(
                "You are not authorized to access vital alerts"
        );
    }

    // =========================================================
    // GET ALERTS BY PATIENT ID
    // =========================================================

    public List<VitalAlert> getAlertsByPatientId(
            String patientId,
            User user) {

        if (patientId == null || patientId.isBlank()) {
            return new ArrayList<>();
        }

        checkPatientAccess(patientId, user);

        return vitalAlertRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    // =========================================================
    // GET OPEN ALERTS
    // =========================================================

    public List<VitalAlert> getOpenAlerts(User user) {

        return getAllAlerts(user)
                .stream()
                .filter(alert ->
                        "OPEN".equalsIgnoreCase(
                                alert.getStatus()))
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE ALERT STATUS
    // =========================================================

    public VitalAlert updateAlertStatus(
            String alertId,
            String status,
            User user) {

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

        VitalAlert alert =
                vitalAlertRepository
                        .findById(alertId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Alert not found with ID: "
                                                + alertId
                                )
                        );

        // Patient cannot modify alert status
        if (user.getRole()
                == com.example.medisphere.model.Role.PATIENT) {

            throw new AccessDeniedException(
                    "Patients cannot update alert status"
            );
        }

        // Doctor can update only alerts belonging
        // to one of their assigned patients
        if (user.getRole()
                == com.example.medisphere.model.Role.DOCTOR) {

            checkPatientAccess(
                    alert.getPatientId(),
                    user
            );
        }

        // ADMIN can update any alert

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

    // =========================================================
    // PATIENT / DOCTOR OWNERSHIP CHECK
    // =========================================================

    private void checkPatientAccess(
            String patientId,
            User user) {

        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------

        if (user.getRole()
                == com.example.medisphere.model.Role.ADMIN) {

            return;
        }

        // -----------------------------------------------------
        // PATIENT
        // -----------------------------------------------------

        if (user.getRole()
                == com.example.medisphere.model.Role.PATIENT) {

            if (user.getPatientId() == null
                    || !user.getPatientId().equals(patientId)) {

                throw new AccessDeniedException(
                        "You are not authorized to access "
                                + "this patient's alerts"
                );
            }

            return;
        }

        // -----------------------------------------------------
        // DOCTOR
        // -----------------------------------------------------

        if (user.getRole()
                == com.example.medisphere.model.Role.DOCTOR) {

            if (user.getDoctorId() == null
                    || user.getDoctorId().isBlank()) {

                throw new AccessDeniedException(
                        "Doctor is not assigned to a doctor ID"
                );
            }

            Patient patient =
                    patientRepository
                            .findById(patientId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Patient not found with ID: "
                                                    + patientId
                                    )
                            );

            if (!user.getDoctorId()
                    .equals(patient.getDoctorId())) {

                throw new AccessDeniedException(
                        "Doctor is not assigned to this patient"
                );
            }

            return;
        }

        // -----------------------------------------------------
        // UNKNOWN ROLE
        // -----------------------------------------------------

        throw new AccessDeniedException(
                "You are not authorized to access "
                        + "this patient's alerts"
        );
    }
}