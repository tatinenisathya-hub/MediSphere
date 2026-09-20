package com.example.medisphere.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorNotificationProducer {

    private final KafkaTemplate<String, DoctorNotificationEvent> kafkaTemplate;

    public void publishNotification(DoctorNotificationEvent event) {

        try {

            kafkaTemplate.send(
                    KafkaConfig.DOCTOR_NOTIFICATIONS_TOPIC,
                    event.getPatientId(),
                    event
            );

            log.info(
                    "Doctor notification published successfully. Alert ID: {}",
                    event.getAlertId()
            );

        } catch (Exception exception) {

            log.error(
                    "Failed to publish doctor notification for alert ID: {}",
                    event.getAlertId(),
                    exception
            );

        }
    }
}