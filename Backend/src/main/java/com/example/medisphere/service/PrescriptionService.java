package com.example.medisphere.service;

import com.example.medisphere.model.Prescription;
import com.example.medisphere.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository) {

        this.prescriptionRepository = prescriptionRepository;
    }

    // Create prescription
    public Prescription addPrescription(
            Prescription prescription) {

        return prescriptionRepository.save(prescription);
    }

    // Get all prescriptions
    public List<Prescription> getAllPrescriptions() {

        return prescriptionRepository.findAll();
    }

    // Get prescriptions by patient ID
    public List<Prescription> getPrescriptionsByPatientId(
            String patientId) {

        return prescriptionRepository.findByPatientId(
                patientId
        );
    }

    // Get prescription by ID
    public Optional<Prescription> getPrescriptionById(
            String id) {

        return prescriptionRepository.findById(id);
    }

    // Update prescription
    public Prescription updatePrescription(
            String id,
            Prescription updatedPrescription) {

        return prescriptionRepository.findById(id)
                .map(prescription -> {

                    prescription.setPatientId(
                            updatedPrescription.getPatientId()
                    );

                    prescription.setDoctorId(
                            updatedPrescription.getDoctorId()
                    );

                    prescription.setAppointmentId(
                            updatedPrescription.getAppointmentId()
                    );

                    prescription.setMedicineName(
                            updatedPrescription.getMedicineName()
                    );

                    prescription.setDosage(
                            updatedPrescription.getDosage()
                    );

                    prescription.setInstructions(
                            updatedPrescription.getInstructions()
                    );

                    return prescriptionRepository.save(
                            prescription
                    );
                })
                .orElse(null);
    }

    // Delete prescription
    public boolean deletePrescription(String id) {

        if (prescriptionRepository.existsById(id)) {

            prescriptionRepository.deleteById(id);

            return true;
        }

        return false;
    }
}