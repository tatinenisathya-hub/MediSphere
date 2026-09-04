package com.example.medisphere.service;

import com.example.medisphere.model.Appointment;
import com.example.medisphere.repository.AppointmentRepository;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.DoctorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // Create appointment
    public Appointment createAppointment(Appointment appointment) {

        // Validate patient
        if (!patientRepository.existsById(appointment.getPatientId())) {
            throw new RuntimeException("Patient not found");
        }

        // Validate doctor
        if (!doctorRepository.existsById(appointment.getDoctorId())) {
            throw new RuntimeException("Doctor not found");
        }

        return appointmentRepository.save(appointment);
    }

    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Get appointment by ID
    public Optional<Appointment> getAppointmentById(String id) {
        return appointmentRepository.findById(id);
    }

    // Update appointment
    public Appointment updateAppointment(
            String id,
            Appointment updatedAppointment) {

        // Validate patient
        if (!patientRepository.existsById(updatedAppointment.getPatientId())) {
            throw new RuntimeException("Patient not found");
        }

        // Validate doctor
        if (!doctorRepository.existsById(updatedAppointment.getDoctorId())) {
            throw new RuntimeException("Doctor not found");
        }

        return appointmentRepository.findById(id)
                .map(appointment -> {

                    appointment.setPatientId(
                            updatedAppointment.getPatientId());

                    appointment.setDoctorId(
                            updatedAppointment.getDoctorId());

                    appointment.setAppointmentDate(
                            updatedAppointment.getAppointmentDate());

                    appointment.setAppointmentTime(
                            updatedAppointment.getAppointmentTime());

                    appointment.setStatus(
                            updatedAppointment.getStatus());

                    appointment.setReason(
                            updatedAppointment.getReason());

                    return appointmentRepository.save(appointment);
                })
                .orElse(null);
    }

    // Delete appointment
    public boolean deleteAppointment(String id) {

        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return true;
        }

        return false;
    }
}