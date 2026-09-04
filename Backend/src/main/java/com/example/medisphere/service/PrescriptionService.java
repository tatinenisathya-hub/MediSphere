package com.example.medisphere.service;

import com.example.medisphere.model.Prescription;
import com.example.medisphere.repository.PrescriptionRepository;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.DoctorRepository;
import com.example.medisphere.repository.AppointmentRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // Create prescription
    public Prescription addPrescription(Prescription prescription) {

        validatePrescriptionReferences(prescription);

        return prescriptionRepository.save(prescription);
    }

    // Get all prescriptions
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    // Get prescription by ID
    public Optional<Prescription> getPrescriptionById(String id) {
        return prescriptionRepository.findById(id);
    }

    // Update prescription
    public Prescription updatePrescription(
            String id,
            Prescription updatedPrescription) {

        validatePrescriptionReferences(updatedPrescription);

        return prescriptionRepository.findById(id)
                .map(prescription -> {

                    prescription.setPatientId(
                            updatedPrescription.getPatientId());

                    prescription.setDoctorId(
                            updatedPrescription.getDoctorId());

                    prescription.setAppointmentId(
                            updatedPrescription.getAppointmentId());

                    prescription.setMedicineName(
                            updatedPrescription.getMedicineName());

                    prescription.setDosage(
                            updatedPrescription.getDosage());

                    prescription.setInstructions(
                            updatedPrescription.getInstructions());

                    return prescriptionRepository.save(prescription);
                })
                .orElse(null);
    }

    // Validate related records
    private void validatePrescriptionReferences(
            Prescription prescription) {

        if (!patientRepository.existsById(
                prescription.getPatientId())) {

            throw new RuntimeException("Patient not found");
        }

        if (!doctorRepository.existsById(
                prescription.getDoctorId())) {

            throw new RuntimeException("Doctor not found");
        }

        if (!appointmentRepository.existsById(
                prescription.getAppointmentId())) {

            throw new RuntimeException("Appointment not found");
        }
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