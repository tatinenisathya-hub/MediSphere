package com.example.medisphere.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.medisphere.model.Patient;
import com.example.medisphere.model.Vital;
import com.example.medisphere.model.WearableDevice;
import com.example.medisphere.model.WearableReadingRequest;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.VitalRepository;
import com.example.medisphere.repository.WearableDeviceRepository;

@Service
public class WearableService {

    private final WearableDeviceRepository wearableDeviceRepository;
    private final PatientRepository patientRepository;
    private final VitalRepository vitalRepository;
    private final ConsentService consentService;

    public WearableService(
            WearableDeviceRepository wearableDeviceRepository,
            PatientRepository patientRepository,
            VitalRepository vitalRepository,
            ConsentService consentService) {

        this.wearableDeviceRepository = wearableDeviceRepository;
        this.patientRepository = patientRepository;
        this.vitalRepository = vitalRepository;
        this.consentService = consentService;
    }

    public WearableDevice connectDevice(WearableDevice device) {

        if (device.getPatientId() == null || device.getPatientId().isBlank()) {
            throw new RuntimeException("Patient ID is required");
        }

        patientRepository.findById(device.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: "
                                        + device.getPatientId()));

        if (device.getDeviceId() == null || device.getDeviceId().isBlank()) {
            throw new RuntimeException("Device ID is required");
        }

        WearableDevice saved = wearableDeviceRepository
                .findByDeviceId(device.getDeviceId())
                .orElse(device);

        saved.setDeviceId(device.getDeviceId());
        saved.setDeviceName(device.getDeviceName());
        saved.setDeviceType(device.getDeviceType());
        saved.setPatientId(device.getPatientId());
        saved.setStatus("CONNECTED");

        LocalDateTime now = LocalDateTime.now();

        if (saved.getConnectedAt() == null) {
            saved.setConnectedAt(now);
        }

        saved.setLastSeen(now);

        return wearableDeviceRepository.save(saved);
    }

    public List<WearableDevice> getDevicesByPatient(String patientId) {
        return wearableDeviceRepository.findByPatientId(patientId);
    }

    public WearableDevice disconnectDevice(String deviceId) {

        WearableDevice device = wearableDeviceRepository
                .findByDeviceId(deviceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Wearable device not found: " + deviceId));

        device.setStatus("DISCONNECTED");
        device.setLastSeen(LocalDateTime.now());

        return wearableDeviceRepository.save(device);
    }

    public Vital ingestReading(WearableReadingRequest request) {

        if (request.getDeviceId() == null
                || request.getDeviceId().isBlank()) {

            throw new RuntimeException("Device ID is required");
        }

        WearableDevice device = wearableDeviceRepository
                .findByDeviceId(request.getDeviceId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Wearable device is not connected"));

        if (!"CONNECTED".equalsIgnoreCase(device.getStatus())) {
            throw new RuntimeException(
                    "Wearable device is disconnected");
        }

        if (request.getPatientId() == null
                || request.getPatientId().isBlank()) {

            throw new RuntimeException("Patient ID is required");
        }

        if (!device.getPatientId().equals(request.getPatientId())) {
            throw new RuntimeException(
                    "Device is not assigned to this patient");
        }

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: "
                                        + request.getPatientId()));

        /*
         * Privacy rule:
         * wearable data can be ingested only with active consent.
         */
        if (!consentService.hasActiveConsent(
                patient.getId(),
                "WEARABLE_DATA")) {

            throw new RuntimeException(
                    "Active WEARABLE_DATA consent is required for this patient");
        }

        Vital vital = new Vital();

        vital.setPatientId(patient.getId());

        vital.setHeartRate(request.getHeartRate());
        vital.setTemperature(request.getTemperature());

        vital.setSystolicBloodPressure(
                request.getSystolicBloodPressure());

        vital.setDiastolicBloodPressure(
                request.getDiastolicBloodPressure());

        vital.setOxygenSaturation(
                request.getOxygenSaturation());

        vital.setRespiratoryRate(
                request.getRespiratoryRate());

        /*
         * Preserve the measurement timestamp received
         * from the wearable/Kafka event.
         *
         * If no timestamp is supplied, use the current
         * server time as a fallback.
         */
        if (request.getRecordedAt() != null) {
            vital.setRecordedAt(request.getRecordedAt());
        } else {
            vital.setRecordedAt(LocalDateTime.now());
        }

        vital.setDeviceId(device.getDeviceId());

        /*
         * Prefer the device type received with the reading.
         * Fall back to the registered device type.
         */
        if (request.getDeviceType() != null
                && !request.getDeviceType().isBlank()) {

            vital.setDeviceType(request.getDeviceType());

        } else {

            vital.setDeviceType(device.getDeviceType());
        }

        vital.setSource("WEARABLE");

        device.setLastSeen(LocalDateTime.now());
        wearableDeviceRepository.save(device);

        return vitalRepository.save(vital);
    }
}