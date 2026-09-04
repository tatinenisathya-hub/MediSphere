package com.example.medisphere.service;

import com.example.medisphere.model.Patient;
import com.example.medisphere.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Add a new patient
    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // Get all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get patient by ID
    public Optional<Patient> getPatientById(String id) {
        return patientRepository.findById(id);
    }

    // Update patient
    public Patient updatePatient(String id, Patient updatedPatient) {

        return patientRepository.findById(id)
                .map(patient -> {
                    patient.setName(updatedPatient.getName());
                    patient.setAge(updatedPatient.getAge());
                    patient.setGender(updatedPatient.getGender());
                    patient.setPhone(updatedPatient.getPhone());
                    patient.setEmail(updatedPatient.getEmail());

                    return patientRepository.save(patient);
                })
                .orElse(null);
    }

    // Delete patient
    public boolean deletePatient(String id) {

        if (patientRepository.existsById(id)) {
            patientRepository.deleteById(id);
            return true;
        }

        return false;
    }
}