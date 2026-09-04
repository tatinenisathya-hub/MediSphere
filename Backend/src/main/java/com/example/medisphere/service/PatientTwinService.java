package com.example.medisphere.service;

import com.example.medisphere.model.PatientTwin;
import com.example.medisphere.repository.PatientTwinRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientTwinService {

    private final PatientTwinRepository patientTwinRepository;

    public PatientTwinService(PatientTwinRepository patientTwinRepository) {
        this.patientTwinRepository = patientTwinRepository;
    }

    public PatientTwin createPatientTwin(PatientTwin patientTwin) {

        return patientTwinRepository.save(patientTwin);
    }

    public List<PatientTwin> getAllPatientTwins() {

        return patientTwinRepository.findAll();
    }

    public PatientTwin getPatientTwinById(String id) {

        return patientTwinRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient Twin not found"));
    }

    public PatientTwin getPatientTwinByPatientId(String patientId) {

        return patientTwinRepository.findByPatientId(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient Twin not found for patient ID: "
                                        + patientId));
    }

    public PatientTwin updatePatientTwin(
            String id,
            PatientTwin updatedPatientTwin) {

        PatientTwin existingTwin = getPatientTwinById(id);

        existingTwin.setPatientId(updatedPatientTwin.getPatientId());
        existingTwin.setPatientName(updatedPatientTwin.getPatientName());
        existingTwin.setEmail(updatedPatientTwin.getEmail());
        existingTwin.setPhone(updatedPatientTwin.getPhone());
        existingTwin.setGender(updatedPatientTwin.getGender());

        existingTwin.setAppointmentIds(
                updatedPatientTwin.getAppointmentIds());

        existingTwin.setPrescriptionIds(
                updatedPatientTwin.getPrescriptionIds());

        return patientTwinRepository.save(existingTwin);
    }

    public void deletePatientTwin(String id) {

        PatientTwin patientTwin = getPatientTwinById(id);

        patientTwinRepository.delete(patientTwin);
    }
}