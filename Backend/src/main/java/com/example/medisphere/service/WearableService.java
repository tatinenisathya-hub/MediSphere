
package com.example.medisphere.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

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
    private final VitalAlertService vitalAlertService;

    public WearableService(
            WearableDeviceRepository wearableDeviceRepository,
            PatientRepository patientRepository,
            VitalRepository vitalRepository,
            ConsentService consentService,
            VitalAlertService vitalAlertService) {

        this.wearableDeviceRepository = wearableDeviceRepository;
        this.patientRepository = patientRepository;
        this.vitalRepository = vitalRepository;
        this.consentService = consentService;
        this.vitalAlertService = vitalAlertService;
    }

    // ---------------------------------------------------------
    // Connect Wearable Device
    // ---------------------------------------------------------

    public WearableDevice connectDevice(WearableDevice device) {

        if (device == null) {
            throw new RuntimeException("Device details are required");
        }

        if (device.getPatientId() == null
                || device.getPatientId().isBlank()) {

            throw new RuntimeException("Patient ID is required");
        }

        if (device.getDeviceId() == null
                || device.getDeviceId().isBlank()) {

            throw new RuntimeException("Device ID is required");
        }

        patientRepository.findById(device.getPatientId())
                .orElseThrow(() -> new RuntimeException(
                        "Patient not found with ID: "
                                + device.getPatientId()));

        WearableDevice savedDevice =
                wearableDeviceRepository
                        .findByDeviceId(device.getDeviceId())
                        .orElse(device);

        savedDevice.setDeviceId(device.getDeviceId());
        savedDevice.setDeviceName(device.getDeviceName());
        savedDevice.setDeviceType(device.getDeviceType());
        savedDevice.setPatientId(device.getPatientId());
        savedDevice.setStatus("CONNECTED");

        LocalDateTime now = LocalDateTime.now();

        if (savedDevice.getConnectedAt() == null) {
            savedDevice.setConnectedAt(now);
        }

        savedDevice.setLastSeen(now);

        return wearableDeviceRepository.save(savedDevice);
    }

    // ---------------------------------------------------------
    // Get Devices By Patient
    // ---------------------------------------------------------

    public List<WearableDevice> getDevicesByPatient(String patientId) {

        if (patientId == null || patientId.isBlank()) {
            throw new RuntimeException("Patient ID is required");
        }

        return wearableDeviceRepository.findByPatientId(patientId);
    }

    // ---------------------------------------------------------
    // Disconnect Wearable Device
    // ---------------------------------------------------------

    public WearableDevice disconnectDevice(String deviceId) {

        if (deviceId == null || deviceId.isBlank()) {
            throw new RuntimeException("Device ID is required");
        }

        WearableDevice device = wearableDeviceRepository
                .findByDeviceId(deviceId)
                .orElseThrow(() -> new RuntimeException(
                        "Wearable device not found: " + deviceId));

        device.setStatus("DISCONNECTED");
        device.setLastSeen(LocalDateTime.now());

        return wearableDeviceRepository.save(device);
    }

    // ---------------------------------------------------------
    // Ingest Wearable Vital Reading
    // ---------------------------------------------------------

    public Vital ingestReading(WearableReadingRequest request) {

        // -----------------------------------------------------
        // Validate Request
        // -----------------------------------------------------

        if (request == null) {
            throw new RuntimeException(
                    "Wearable reading request is required");
        }

        // -----------------------------------------------------
        // Validate Device ID
        // -----------------------------------------------------

        if (request.getDeviceId() == null
                || request.getDeviceId().isBlank()) {

            throw new RuntimeException("Device ID is required");
        }

        // -----------------------------------------------------
        // Validate Patient ID
        // -----------------------------------------------------

        if (request.getPatientId() == null
                || request.getPatientId().isBlank()) {

            throw new RuntimeException("Patient ID is required");
        }

        // -----------------------------------------------------
        // Find Registered Wearable Device
        // -----------------------------------------------------

        WearableDevice device = wearableDeviceRepository
                .findByDeviceId(request.getDeviceId())
                .orElseThrow(() -> new RuntimeException(
                        "Wearable device is not registered: "
                                + request.getDeviceId()));

        // -----------------------------------------------------
        // Validate Device Connection Status
        // -----------------------------------------------------

        if (!"CONNECTED".equalsIgnoreCase(device.getStatus())) {

            throw new RuntimeException(
                    "Wearable device is disconnected");
        }

        // -----------------------------------------------------
        // Validate Device-Patient Assignment
        // -----------------------------------------------------

        if (!Objects.equals(
                device.getPatientId(),
                request.getPatientId())) {

            throw new RuntimeException(
                    "Device is not assigned to this patient");
        }

        // -----------------------------------------------------
        // Validate Patient Existence
        // -----------------------------------------------------

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException(
                        "Patient not found with ID: "
                                + request.getPatientId()));

        // -----------------------------------------------------
        // Validate Active Wearable Consent
        // -----------------------------------------------------

        /*
         * Wearable data can be ingested only when
         * the patient has active WEARABLE_DATA consent.
         */

        if (!consentService.hasActiveConsent(
                patient.getId(),
                "WEARABLE_DATA")) {

            throw new RuntimeException(
                    "Active WEARABLE_DATA consent is required "
                            + "for this patient");
        }

        // -----------------------------------------------------
        // Create Vital Entity
        // -----------------------------------------------------

        Vital vital = new Vital();

        /*
         * Use the patient ID from the registered patient.
         */

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

        // -----------------------------------------------------
        // Set Measurement Timestamp
        // -----------------------------------------------------

        /*
         * Preserve the timestamp from the wearable event.
         * If unavailable, use the current server timestamp.
         */

        if (request.getRecordedAt() != null) {

            vital.setRecordedAt(request.getRecordedAt());

        } else {

            vital.setRecordedAt(LocalDateTime.now());
        }

        // -----------------------------------------------------
        // Set Device Metadata
        // -----------------------------------------------------

        /*
         * Always use the registered device ID.
         * This prevents incorrect device metadata.
         */

        vital.setDeviceId(device.getDeviceId());

        /*
         * Use the registered device type.
         * This ensures consistent device information.
         */

        vital.setDeviceType(device.getDeviceType());

        vital.setSource("WEARABLE");

        // -----------------------------------------------------
        // Update Device Last Seen Timestamp
        // -----------------------------------------------------

        device.setLastSeen(LocalDateTime.now());

        wearableDeviceRepository.save(device);

        // -----------------------------------------------------
        // Save Vital Reading to MongoDB
        // -----------------------------------------------------

        Vital savedVital = vitalRepository.save(vital);

        // -----------------------------------------------------
        // Milestone 3: Evaluate Vital and Generate Alerts
        // -----------------------------------------------------

        /*
         * Evaluate the saved vital reading.
         *
         * If a vital value crosses its configured threshold,
         * VitalAlertService creates an alert in MongoDB.
         */

        vitalAlertService.evaluateVital(savedVital);

        // -----------------------------------------------------
        // Return Saved Vital
        // -----------------------------------------------------

        return savedVital;
    }
}