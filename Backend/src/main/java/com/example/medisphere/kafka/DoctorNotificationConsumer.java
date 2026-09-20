
package com.example.medisphere.kafka;

import java.time.LocalDateTime;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.medisphere.model.DoctorNotification;
import com.example.medisphere.repository.DoctorNotificationRepository;
import com.example.medisphere.service.SseNotificationService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DoctorNotificationConsumer {

    private final DoctorNotificationRepository notificationRepository;

    private final SseNotificationService sseNotificationService;

    public DoctorNotificationConsumer(
            DoctorNotificationRepository notificationRepository,
            SseNotificationService sseNotificationService) {

        this.notificationRepository = notificationRepository;
        this.sseNotificationService = sseNotificationService;
    }

    @KafkaListener(
            topics = KafkaConfig.DOCTOR_NOTIFICATIONS_TOPIC,
            groupId = "doctor-notification-group",
            containerFactory = "doctorKafkaListenerContainerFactory"
    )
    public void consumeNotification(
            DoctorNotificationEvent event) {

        if (event == null) {

            log.warn(
                    "Received empty doctor notification event"
            );

            return;
        }

        try {

            log.info("========================================");
            log.info("DOCTOR NOTIFICATION RECEIVED");
            log.info("========================================");

            log.info(
                    "Notification ID: {}",
                    event.getNotificationId()
            );

            log.info(
                    "Alert ID: {}",
                    event.getAlertId()
            );

            log.info(
                    "Patient ID: {}",
                    event.getPatientId()
            );

            log.info(
                    "Vital Type: {}",
                    event.getVitalType()
            );

            log.info(
                    "Measured Value: {}",
                    event.getMeasuredValue()
            );

            log.info(
                    "Severity: {}",
                    event.getSeverity()
            );

            // =====================================
            // VALIDATE NOTIFICATION ID
            // =====================================

            if (event.getNotificationId() == null
                    || event.getNotificationId().isBlank()) {

                log.warn(
                        "Notification ignored because notification ID is missing"
                );

                return;
            }

            // =====================================
            // PREVENT DUPLICATE NOTIFICATIONS
            // =====================================

            if (notificationRepository.existsByNotificationId(
                    event.getNotificationId()
            )) {

                log.warn(
                        "Duplicate notification ignored: {}",
                        event.getNotificationId()
                );

                return;
            }

            // =====================================
            // CREATE MONGODB DOCUMENT
            // =====================================

            DoctorNotification notification =
                    new DoctorNotification();

            notification.setNotificationId(
                    event.getNotificationId()
            );

            notification.setAlertId(
                    event.getAlertId()
            );

            notification.setPatientId(
                    event.getPatientId()
            );

            notification.setVitalType(
                    event.getVitalType()
            );

            notification.setMeasuredValue(
                    event.getMeasuredValue()
            );

            notification.setUnit(
                    event.getUnit()
            );

            notification.setSeverity(
                    event.getSeverity()
            );

            notification.setMessage(
                    event.getMessage()
            );

            notification.setRecordedAt(
                    event.getRecordedAt()
            );

            notification.setCreatedAt(
                    event.getCreatedAt()
            );

            notification.setReceivedAt(
                    LocalDateTime.now()
            );

            notification.setStatus(
                    event.getStatus() != null
                            ? event.getStatus()
                            : "OPEN"
            );

            // =====================================
            // SAVE NOTIFICATION TO MONGODB
            // =====================================

            DoctorNotification savedNotification =
                    notificationRepository.save(notification);

            log.info(
                    "Doctor notification saved successfully. MongoDB ID: {}",
                    savedNotification.getId()
            );

            // =====================================
            // SEND REAL-TIME SSE NOTIFICATION
            // =====================================

            sseNotificationService.publishNotification(event);

            log.info(
                    "Doctor notification broadcast to frontend successfully. Alert ID: {}",
                    event.getAlertId()
            );

            log.info("========================================");

        } catch (Exception exception) {

            log.error(
                    "Error while processing doctor notification. Alert ID: {}",
                    event.getAlertId(),
                    exception
            );

            throw exception;
        }
    }
}