package com.example.medisphere.kafka;

import com.example.medisphere.model.WearableReadingRequest;
import com.example.medisphere.service.WearableService;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class WearableVitalsConsumer {

    private final WearableService wearableService;

    public WearableVitalsConsumer(WearableService wearableService) {
        this.wearableService = wearableService;
    }

    @KafkaListener(
            topics = KafkaConfig.WEARABLE_VITALS_TOPIC,
            groupId = KafkaConfig.WEARABLE_VITALS_GROUP
    )
    public void consume(WearableVitalEvent event) {

        System.out.println(
                "Received wearable vital event from Kafka: "
                        + event.getEventId()
        );

        try {

            WearableReadingRequest request =
                    new WearableReadingRequest();

            request.setDeviceId(event.getDeviceId());
            request.setPatientId(event.getPatientId());
            request.setDeviceType(event.getDeviceType());

            request.setHeartRate(event.getHeartRate());
            request.setTemperature(event.getTemperature());

            request.setSystolicBloodPressure(
                    event.getSystolicBloodPressure()
            );

            request.setDiastolicBloodPressure(
                    event.getDiastolicBloodPressure()
            );

            request.setOxygenSaturation(
                    event.getOxygenSaturation()
            );

            request.setRespiratoryRate(
                    event.getRespiratoryRate()
            );

            request.setRecordedAt(event.getRecordedAt());

            wearableService.ingestReading(request);

            System.out.println(
                    "Wearable vital successfully processed for patient: "
                            + event.getPatientId()
            );

        } catch (Exception e) {

            System.err.println(
                    "Failed to process wearable vital event "
                            + event.getEventId()
                            + ": "
                            + e.getMessage()
            );
        }
    }
}