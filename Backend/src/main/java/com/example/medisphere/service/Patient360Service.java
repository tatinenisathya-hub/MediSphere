package com.example.medisphere.service;

import com.example.medisphere.model.Appointment;
import com.example.medisphere.model.Doctor;
import com.example.medisphere.model.Patient;
import com.example.medisphere.model.Patient360Response;
import com.example.medisphere.model.PatientTwin;
import com.example.medisphere.model.Prescription;
import com.example.medisphere.model.Vital;

import com.example.medisphere.repository.AppointmentRepository;
import com.example.medisphere.repository.DoctorRepository;
import com.example.medisphere.repository.PatientRepository;
import com.example.medisphere.repository.PatientTwinRepository;
import com.example.medisphere.repository.PrescriptionRepository;
import com.example.medisphere.repository.VitalRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class Patient360Service {

    private final PatientRepository patientRepository;
    private final PatientTwinRepository patientTwinRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalRepository vitalRepository;
    private final DoctorRepository doctorRepository;

    public Patient360Service(
            PatientRepository patientRepository,
            PatientTwinRepository patientTwinRepository,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            VitalRepository vitalRepository,
            DoctorRepository doctorRepository) {

        this.patientRepository = patientRepository;
        this.patientTwinRepository = patientTwinRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalRepository = vitalRepository;
        this.doctorRepository = doctorRepository;
    }

    public Patient360Response getPatient360(String patientId) {

        // -----------------------------
        // Get Patient
        // -----------------------------

        Patient patient = patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: " + patientId
                        )
                );


        // -----------------------------
        // Get Patient Twin
        // -----------------------------

        PatientTwin patientTwin = patientTwinRepository
                .findByPatientId(patientId)
                .orElse(null);


        // -----------------------------
        // Get Appointments
        // -----------------------------

        List<Appointment> appointments =
                appointmentRepository.findAll()
                        .stream()
                        .filter(appointment ->
                                patientId.equals(
                                        appointment.getPatientId()
                                )
                        )
                        .collect(Collectors.toList());


        // -----------------------------
        // Get Prescriptions
        // -----------------------------

        List<Prescription> prescriptions =
                prescriptionRepository.findAll()
                        .stream()
                        .filter(prescription ->
                                patientId.equals(
                                        prescription.getPatientId()
                                )
                        )
                        .collect(Collectors.toList());


        // -----------------------------
        // Get Vitals
        // -----------------------------

        List<Vital> vitals =
                vitalRepository.findAll()
                        .stream()
                        .filter(vital ->
                                patientId.equals(
                                        vital.getPatientId()
                                )
                        )
                        .collect(Collectors.toList());


        // -----------------------------
        // Get Related Doctors
        // -----------------------------

        List<String> doctorIds = new ArrayList<>();

        for (Appointment appointment : appointments) {

            if (appointment.getDoctorId() != null
                    && !doctorIds.contains(
                            appointment.getDoctorId()
                    )) {

                doctorIds.add(
                        appointment.getDoctorId()
                );
            }
        }


        for (Prescription prescription : prescriptions) {

            if (prescription.getDoctorId() != null
                    && !doctorIds.contains(
                            prescription.getDoctorId()
                    )) {

                doctorIds.add(
                        prescription.getDoctorId()
                );
            }
        }


        List<Doctor> doctors =
                doctorRepository.findAllById(doctorIds);


        // -----------------------------
        // Build Patient 360 Response
        // -----------------------------

        return new Patient360Response(

                patient,
                patientTwin,
                appointments,
                prescriptions,
                vitals,
                doctors

        );
    }
}