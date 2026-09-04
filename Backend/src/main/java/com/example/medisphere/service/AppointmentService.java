package com.example.medisphere.service;

import com.example.medisphere.model.Appointment;
import com.example.medisphere.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository) {

        this.appointmentRepository = appointmentRepository;
    }

    // Create appointment
    public Appointment createAppointment(
            Appointment appointment) {

        return appointmentRepository.save(appointment);
    }

    // Get all appointments
    public List<Appointment> getAllAppointments() {

        return appointmentRepository.findAll();
    }

    // Get appointments by patient ID
    public List<Appointment> getAppointmentsByPatientId(
            String patientId) {

        return appointmentRepository.findByPatientId(
                patientId
        );
    }

    // Get appointment by ID
    public Optional<Appointment> getAppointmentById(
            String id) {

        return appointmentRepository.findById(id);
    }

    // Update appointment
    public Appointment updateAppointment(
            String id,
            Appointment updatedAppointment) {

        return appointmentRepository.findById(id)
                .map(appointment -> {

                    appointment.setPatientId(
                            updatedAppointment.getPatientId()
                    );

                    appointment.setDoctorId(
                            updatedAppointment.getDoctorId()
                    );

                    appointment.setAppointmentDate(
                            updatedAppointment.getAppointmentDate()
                    );

                    appointment.setAppointmentTime(
                            updatedAppointment.getAppointmentTime()
                    );

                    appointment.setStatus(
                            updatedAppointment.getStatus()
                    );

                    appointment.setReason(
                            updatedAppointment.getReason()
                    );

                    return appointmentRepository.save(
                            appointment
                    );
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