package com.example.medisphere.service;

import com.example.medisphere.model.Patient;
import com.example.medisphere.model.Role;
import com.example.medisphere.model.User;
import com.example.medisphere.model.Vital;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.VitalRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class VitalService {

    private final VitalRepository vitalRepository;
    private final PatientRepository patientRepository;
    private final VitalAlertService vitalAlertService;

    public VitalService(
            VitalRepository vitalRepository,
            PatientRepository patientRepository,
            VitalAlertService vitalAlertService
    ) {
        this.vitalRepository = vitalRepository;
        this.patientRepository = patientRepository;
        this.vitalAlertService = vitalAlertService;
    }

    // =========================================================
    // CREATE VITAL
    // =========================================================

    public Vital createVital(Vital vital, User user) {

        if (vital == null || vital.getPatientId() == null) {
            throw new IllegalArgumentException(
                    "Patient ID is required"
            );
        }

        checkPatientAccess(user, vital.getPatientId());

        if (vital.getRecordedAt() == null) {
            vital.setRecordedAt(LocalDateTime.now());
        }

        // Save the vital first so MongoDB generates its ID
        Vital savedVital = vitalRepository.save(vital);

        // Evaluate thresholds and generate alerts/notifications
        vitalAlertService.evaluateVital(savedVital);

        return savedVital;
    }

    // =========================================================
    // GET ALL VITALS
    // ADMIN / ASSIGNED DOCTOR
    // =========================================================

    public List<Vital> getAllVitals(User user) {

        if (user == null) {
            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------
        // Admin can view all vital records.
        if (user.getRole() == Role.ADMIN) {
            return vitalRepository.findAll();
        }

        // -----------------------------------------------------
        // DOCTOR
        // -----------------------------------------------------
        // Doctor can view vitals only for patients assigned
        // to that doctor.
        if (user.getRole() == Role.DOCTOR) {

            if (user.getDoctorId() == null) {
                throw new AccessDeniedException(
                        "Doctor is not assigned"
                );
            }

            List<Patient> assignedPatients =
                    patientRepository.findAll()
                            .stream()
                            .filter(patient ->
                                    user.getDoctorId()
                                            .equals(patient.getDoctorId())
                            )
                            .toList();

            List<Vital> doctorVitals =
                    new ArrayList<>();

            for (Patient patient : assignedPatients) {

                doctorVitals.addAll(
                        vitalRepository.findByPatientId(
                                patient.getId()
                        )
                );
            }

            return doctorVitals;
        }

        // -----------------------------------------------------
        // PATIENT
        // -----------------------------------------------------
        // Patients should use the patient-specific endpoint
        // instead of requesting all vital records.
        throw new AccessDeniedException(
                "Patients cannot access all vital records"
        );
    }

    // =========================================================
    // GET VITAL BY PATIENT
    // ADMIN / ASSIGNED DOCTOR / OWN PATIENT
    // =========================================================

    public List<Vital> getVitalsByPatientId(
            String patientId,
            User user
    ) {

        checkPatientAccess(user, patientId);

        return vitalRepository.findByPatientId(patientId);
    }

    // =========================================================
    // GET VITAL BY ID
    // ADMIN / ASSIGNED DOCTOR / OWN PATIENT
    // =========================================================

    public Optional<Vital> getVitalById(
            String id,
            User user
    ) {

        Optional<Vital> vital =
                vitalRepository.findById(id);

        if (vital.isEmpty()) {
            return Optional.empty();
        }

        checkPatientAccess(
                user,
                vital.get().getPatientId()
        );

        return vital;
    }

    // =========================================================
    // UPDATE VITAL
    // ADMIN / ASSIGNED DOCTOR ONLY
    // =========================================================

    public Vital updateVital(
            String id,
            Vital updatedVital,
            User user
    ) {

        Optional<Vital> existingVital =
                vitalRepository.findById(id);

        if (existingVital.isEmpty()) {
            return null;
        }

        Vital vital = existingVital.get();

        // Only ADMIN and DOCTOR can update
        if (user.getRole() == Role.PATIENT) {
            throw new AccessDeniedException(
                    "Patients are not allowed to update vitals"
            );
        }

        checkPatientAccess(
                user,
                vital.getPatientId()
        );

        // Prevent changing the vital to another patient's record
        if (updatedVital.getPatientId() != null
                && !vital.getPatientId()
                .equals(updatedVital.getPatientId())) {

            throw new AccessDeniedException(
                    "A vital cannot be moved to another patient"
            );
        }

        vital.setHeartRate(
                updatedVital.getHeartRate()
        );

        vital.setTemperature(
                updatedVital.getTemperature()
        );

        vital.setSystolicBloodPressure(
                updatedVital.getSystolicBloodPressure()
        );

        vital.setDiastolicBloodPressure(
                updatedVital.getDiastolicBloodPressure()
        );

        vital.setOxygenSaturation(
                updatedVital.getOxygenSaturation()
        );

        vital.setRespiratoryRate(
                updatedVital.getRespiratoryRate()
        );

        if (updatedVital.getRecordedAt() != null) {
            vital.setRecordedAt(
                    updatedVital.getRecordedAt()
            );
        }

        return vitalRepository.save(vital);
    }

    // =========================================================
    // DELETE VITAL
    // ADMIN ONLY
    // =========================================================

    public boolean deleteVital(
            String id,
            User user
    ) {

        requireRole(user, Role.ADMIN);

        if (!vitalRepository.existsById(id)) {
            return false;
        }

        vitalRepository.deleteById(id);

        return true;
    }

    // =========================================================
    // PATIENT / DOCTOR ACCESS CHECK
    // =========================================================

    private void checkPatientAccess(
            User user,
            String patientId
    ) {

        if (user == null) {
            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------
        // Admin can access everything.
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        // -----------------------------------------------------
        // PATIENT
        // -----------------------------------------------------
        // Patient can access only their own record.
        if (user.getRole() == Role.PATIENT) {

            if (user.getPatientId() == null
                    || !user.getPatientId()
                    .equals(patientId)) {

                throw new AccessDeniedException(
                        "Patients can access only their own vitals"
                );
            }

            return;
        }

        // -----------------------------------------------------
        // DOCTOR
        // -----------------------------------------------------
        // Doctor can access only assigned patients.
        if (user.getRole() == Role.DOCTOR) {

            if (user.getDoctorId() == null) {
                throw new AccessDeniedException(
                        "Doctor is not assigned"
                );
            }

            Patient patient =
                    patientRepository
                            .findById(patientId)
                            .orElseThrow(() ->
                                    new AccessDeniedException(
                                            "Patient not found"
                                    )
                            );

            if (patient.getDoctorId() == null
                    || !user.getDoctorId()
                    .equals(patient.getDoctorId())) {

                throw new AccessDeniedException(
                        "Doctor is not assigned to this patient"
                );
            }

            return;
        }

        throw new AccessDeniedException(
                "Access denied"
        );
    }

    // =========================================================
    // ROLE CHECK
    // =========================================================

    private void requireRole(
            User user,
            Role requiredRole
    ) {

        if (user == null
                || user.getRole() != requiredRole) {

            throw new AccessDeniedException(
                    "Access denied"
            );
        }
    }
}