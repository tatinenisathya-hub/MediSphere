package com.example.medisphere.service;

import com.example.medisphere.model.Patient;
import com.example.medisphere.model.PatientTwin;

import com.example.medisphere.repository.AppointmentRepository;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.PatientTwinRepository;
import com.example.medisphere.repository.PrescriptionRepository;
import com.example.medisphere.repository.VitalRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PatientTwinService {

    private final PatientTwinRepository patientTwinRepository;

    private final PatientRepository patientRepository;

    private final AppointmentRepository appointmentRepository;

    private final PrescriptionRepository prescriptionRepository;

    private final VitalRepository vitalRepository;


    public PatientTwinService(
            PatientTwinRepository patientTwinRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            VitalRepository vitalRepository
    ) {

        this.patientTwinRepository = patientTwinRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalRepository = vitalRepository;
    }


    // =====================================
    // CREATE PATIENT TWIN MANUALLY
    // =====================================

    public PatientTwin createPatientTwin(
            PatientTwin patientTwin
    ) {

        if (patientTwin.getCreatedAt() == null) {
            patientTwin.setCreatedAt(LocalDateTime.now());
        }

        patientTwin.setUpdatedAt(LocalDateTime.now());

        return patientTwinRepository.save(patientTwin);
    }


    // =====================================
    // GET ALL PATIENT TWINS
    // =====================================

    public List<PatientTwin> getAllPatientTwins() {

        return patientTwinRepository.findAll();
    }


    // =====================================
    // GET PATIENT TWIN BY TWIN ID
    // =====================================

    public PatientTwin getPatientTwinById(
            String id
    ) {

        return patientTwinRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient Twin not found"
                        )
                );
    }


    // =====================================
    // GET PATIENT TWIN BY PATIENT ID
    // =====================================

    public PatientTwin getPatientTwinByPatientId(
            String patientId
    ) {

        return patientTwinRepository
                .findByPatientId(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient Twin not found for patient ID: "
                                        + patientId
                        )
                );
    }


    // =====================================
    // GENERATE PATIENT DIGITAL TWIN
    // =====================================

    public PatientTwin generatePatientTwin(
            String patientId
    ) {

        // Check whether the patient already
        // has a Digital Twin
        if (patientTwinRepository
                .findByPatientId(patientId)
                .isPresent()) {

            return refreshPatientTwin(patientId);
        }


        // Get patient information
        Patient patient = patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found"
                        )
                );


        // Get appointment IDs
        List<String> appointmentIds =
                appointmentRepository
                        .findByPatientId(patientId)
                        .stream()
                        .map(appointment ->
                                appointment.getId()
                        )
                        .toList();


        // Get prescription IDs
        List<String> prescriptionIds =
                prescriptionRepository
                        .findByPatientId(patientId)
                        .stream()
                        .map(prescription ->
                                prescription.getId()
                        )
                        .toList();


        // Get vital IDs
        List<String> vitalIds =
                vitalRepository
                        .findByPatientId(patientId)
                        .stream()
                        .map(vital ->
                                vital.getId()
                        )
                        .toList();


        // Create Patient Digital Twin
        PatientTwin patientTwin =
                new PatientTwin();


        // Patient information
        patientTwin.setPatientId(
                patient.getId()
        );

        patientTwin.setPatientName(
                patient.getName()
        );

        patientTwin.setAge(
                patient.getAge()
        );

        patientTwin.setEmail(
                patient.getEmail()
        );

        patientTwin.setPhone(
                patient.getPhone()
        );

        patientTwin.setGender(
                patient.getGender()
        );


        // Connected healthcare records
        patientTwin.setAppointmentIds(
                appointmentIds
        );

        patientTwin.setPrescriptionIds(
                prescriptionIds
        );

        patientTwin.setVitalIds(
                vitalIds
        );


        // Digital Twin metadata
        patientTwin.setCreatedAt(
                LocalDateTime.now()
        );

        patientTwin.setUpdatedAt(
                LocalDateTime.now()
        );


        return patientTwinRepository
                .save(patientTwin);
    }


    // =====================================
    // REFRESH PATIENT DIGITAL TWIN
    // =====================================

    public PatientTwin refreshPatientTwin(
            String patientId
    ) {

        // Get existing Digital Twin
        PatientTwin existingTwin =
                patientTwinRepository
                        .findByPatientId(patientId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient Twin not found"
                                )
                        );


        // Get latest patient information
        Patient patient =
                patientRepository
                        .findById(patientId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found"
                                )
                        );


        // Get latest appointments
        List<String> appointmentIds =
                appointmentRepository
                        .findByPatientId(patientId)
                        .stream()
                        .map(appointment ->
                                appointment.getId()
                        )
                        .toList();


        // Get latest prescriptions
        List<String> prescriptionIds =
                prescriptionRepository
                        .findByPatientId(patientId)
                        .stream()
                        .map(prescription ->
                                prescription.getId()
                        )
                        .toList();


        // Get latest vitals
        List<String> vitalIds =
                vitalRepository
                        .findByPatientId(patientId)
                        .stream()
                        .map(vital ->
                                vital.getId()
                        )
                        .toList();


        // Update patient information
        existingTwin.setPatientId(
                patient.getId()
        );

        existingTwin.setPatientName(
                patient.getName()
        );

        existingTwin.setAge(
                patient.getAge()
        );

        existingTwin.setEmail(
                patient.getEmail()
        );

        existingTwin.setPhone(
                patient.getPhone()
        );

        existingTwin.setGender(
                patient.getGender()
        );


        // Update connected healthcare records
        existingTwin.setAppointmentIds(
                appointmentIds
        );

        existingTwin.setPrescriptionIds(
                prescriptionIds
        );

        existingTwin.setVitalIds(
                vitalIds
        );


        // Update timestamp
        existingTwin.setUpdatedAt(
                LocalDateTime.now()
        );


        return patientTwinRepository
                .save(existingTwin);
    }


    // =====================================
    // UPDATE PATIENT TWIN
    // =====================================

    public PatientTwin updatePatientTwin(
            String id,
            PatientTwin updatedPatientTwin
    ) {

        PatientTwin existingTwin =
                getPatientTwinById(id);


        existingTwin.setPatientId(
                updatedPatientTwin.getPatientId()
        );

        existingTwin.setPatientName(
                updatedPatientTwin.getPatientName()
        );

        existingTwin.setAge(
                updatedPatientTwin.getAge()
        );

        existingTwin.setEmail(
                updatedPatientTwin.getEmail()
        );

        existingTwin.setPhone(
                updatedPatientTwin.getPhone()
        );

        existingTwin.setGender(
                updatedPatientTwin.getGender()
        );


        // Update healthcare record IDs
        existingTwin.setAppointmentIds(
                updatedPatientTwin.getAppointmentIds()
        );

        existingTwin.setPrescriptionIds(
                updatedPatientTwin.getPrescriptionIds()
        );

        existingTwin.setVitalIds(
                updatedPatientTwin.getVitalIds()
        );


        // Keep createdAt unchanged
        // Update only updatedAt
        existingTwin.setUpdatedAt(
                LocalDateTime.now()
        );


        return patientTwinRepository
                .save(existingTwin);
    }


    // =====================================
    // DELETE PATIENT TWIN
    // =====================================

    public void deletePatientTwin(
            String id
    ) {

        PatientTwin patientTwin =
                getPatientTwinById(id);

        patientTwinRepository
                .delete(patientTwin);
    }
}