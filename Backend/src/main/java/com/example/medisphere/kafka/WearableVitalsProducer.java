package com.example.medisphere.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class WearableVitalsProducer {

    private final KafkaTemplate<String, WearableVitalEvent> kafkaTemplate;

    public WearableVitalsProducer(
            KafkaTemplate<String, WearableVitalEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(WearableVitalEvent event) {

        String key = event.getPatientId();

        kafkaTemplate.send(
                KafkaConfig.WEARABLE_VITALS_TOPIC,
                key,
                event
        );
    }
}