package com.example.medisphere.service;

import com.example.medisphere.model.LabResult;
import com.example.medisphere.model.Patient;
import com.example.medisphere.repository.LabResultRepository;
import com.example.medisphere.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LabResultService {

    private final LabResultRepository labResultRepository;
    private final PatientRepository patientRepository;

    public LabResultService(
            LabResultRepository labResultRepository,
            PatientRepository patientRepository
    ) {
        this.labResultRepository = labResultRepository;
        this.patientRepository = patientRepository;
    }

    public LabResult create(LabResult labResult) {

        validateLabResult(labResult);

        if (!patientRepository.existsById(labResult.getPatientId())) {
            throw new IllegalArgumentException(
                    "Patient not found: " + labResult.getPatientId()
            );
        }

        if (labResult.getCreatedAt() == null) {
            labResult.setCreatedAt(LocalDateTime.now());
        }

        return labResultRepository.save(labResult);
    }

    public List<LabResult> getAll() {
        return labResultRepository.findAll();
    }

    public LabResult getById(String id) {
        return labResultRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Lab result not found: " + id)
                );
    }

    public List<LabResult> getByPatientId(String patientId) {

        if (!patientRepository.existsById(patientId)) {
            throw new IllegalArgumentException(
                    "Patient not found: " + patientId
            );
        }

        return labResultRepository.findByPatientIdOrderByPerformedAtDesc(patientId);
    }

    public LabResult update(String id, LabResult updated) {

        LabResult existing = getById(id);

        validateLabResult(updated);

        if (!patientRepository.existsById(updated.getPatientId())) {
            throw new IllegalArgumentException(
                    "Patient not found: " + updated.getPatientId()
            );
        }

        existing.setPatientId(updated.getPatientId());
        existing.setTestName(updated.getTestName());
        existing.setTestCode(updated.getTestCode());
        existing.setValue(updated.getValue());
        existing.setUnit(updated.getUnit());
        existing.setReferenceRange(updated.getReferenceRange());
        existing.setStatus(updated.getStatus());
        existing.setPerformedAt(updated.getPerformedAt());

        return labResultRepository.save(existing);
    }

    public void delete(String id) {
        if (!labResultRepository.existsById(id)) {
            throw new RuntimeException("Lab result not found: " + id);
        }

        labResultRepository.deleteById(id);
    }

    private void validateLabResult(LabResult labResult) {

        if (labResult.getPatientId() == null ||
                labResult.getPatientId().isBlank()) {

            throw new IllegalArgumentException("Patient ID is required");
        }

        if (labResult.getTestName() == null ||
                labResult.getTestName().isBlank()) {

            throw new IllegalArgumentException("Test name is required");
        }

        if (labResult.getValue() == null) {
            throw new IllegalArgumentException("Test value is required");
        }

        if (labResult.getPerformedAt() == null) {
            throw new IllegalArgumentException(
                    "Performed date and time are required"
            );
        }
    }
}