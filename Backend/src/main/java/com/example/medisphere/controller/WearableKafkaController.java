package com.example.medisphere.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.medisphere.kafka.WearableVitalEvent;
import com.example.medisphere.kafka.WearableVitalsProducer;
import com.example.medisphere.model.WearableReadingRequest;

@RestController
@RequestMapping("/api/wearables")
public class WearableKafkaController {

    private final WearableVitalsProducer wearableVitalsProducer;

    public WearableKafkaController(
            WearableVitalsProducer wearableVitalsProducer) {
        this.wearableVitalsProducer = wearableVitalsProducer;
    }

    @PostMapping("/readings/kafka")
    public ResponseEntity<String> publishWearableReading(
            @RequestBody WearableReadingRequest request) {

        WearableVitalEvent event = new WearableVitalEvent();

        event.setEventId(UUID.randomUUID().toString());
        event.setDeviceId(request.getDeviceId());
        event.setPatientId(request.getPatientId());
        event.setDeviceType(request.getDeviceType());

        event.setHeartRate(request.getHeartRate());
        event.setTemperature(request.getTemperature());
        event.setSystolicBloodPressure(
                request.getSystolicBloodPressure());
        event.setDiastolicBloodPressure(
                request.getDiastolicBloodPressure());
        event.setOxygenSaturation(
                request.getOxygenSaturation());
        event.setRespiratoryRate(
                request.getRespiratoryRate());

        event.setRecordedAt(
                request.getRecordedAt() != null
                        ? request.getRecordedAt()
                        : LocalDateTime.now()
        );

        wearableVitalsProducer.publish(event);

        return ResponseEntity.ok(
                "Wearable vital event published to Kafka"
        );
    }
}