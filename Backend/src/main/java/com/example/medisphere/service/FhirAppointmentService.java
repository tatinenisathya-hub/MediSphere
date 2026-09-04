package com.example.medisphere.service;

import ca.uhn.fhir.context.FhirContext;
import com.example.medisphere.model.Appointment;
import com.example.medisphere.repository.AppointmentRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Reference;
import org.springframework.stereotype.Service;

@Service
public class FhirAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final FhirContext fhirContext;

    public FhirAppointmentService(
            AppointmentRepository appointmentRepository) {

        this.appointmentRepository = appointmentRepository;
        this.fhirContext = FhirContext.forR4();
    }

    public String getFhirAppointment(String appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Appointment not found with ID: "
                                        + appointmentId
                        )
                );

        org.hl7.fhir.r4.model.Appointment fhirAppointment =
                new org.hl7.fhir.r4.model.Appointment();

        // FHIR Appointment ID
        fhirAppointment.setId(appointment.getId());

        // Appointment Status
        fhirAppointment.setStatus(
                mapAppointmentStatus(appointment.getStatus())
        );

        // Patient Participant
        if (appointment.getPatientId() != null
                && !appointment.getPatientId().isBlank()) {

            fhirAppointment
                    .addParticipant()
                    .setActor(
                            new Reference(
                                    "Patient/"
                                            + appointment.getPatientId()
                            )
                    )
                    .setStatus(
                            org.hl7.fhir.r4.model.Appointment
                                    .ParticipationStatus.ACCEPTED
                    );
        }

        // Doctor Participant
        if (appointment.getDoctorId() != null
                && !appointment.getDoctorId().isBlank()) {

            fhirAppointment
                    .addParticipant()
                    .setActor(
                            new Reference(
                                    "Practitioner/"
                                            + appointment.getDoctorId()
                            )
                    )
                    .setStatus(
                            org.hl7.fhir.r4.model.Appointment
                                    .ParticipationStatus.ACCEPTED
                    );
        }

        // Appointment Reason
        if (appointment.getReason() != null
                && !appointment.getReason().isBlank()) {

            CodeableConcept reason = new CodeableConcept();
            reason.setText(appointment.getReason());

            fhirAppointment.addReasonCode(reason);
        }

        // Appointment Date and Time
        Date appointmentStart =
                parseAppointmentDateTime(
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime()
                );

        if (appointmentStart != null) {
            fhirAppointment.setStart(appointmentStart);
        }

        // Convert FHIR Appointment to JSON
        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(fhirAppointment);
    }

    private org.hl7.fhir.r4.model.Appointment.AppointmentStatus
    mapAppointmentStatus(String status) {

        if (status == null) {
            return org.hl7.fhir.r4.model.Appointment
                    .AppointmentStatus.PROPOSED;
        }

        switch (status.toLowerCase()) {

            case "scheduled":
            case "booked":
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.BOOKED;

            case "completed":
            case "fulfilled":
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.FULFILLED;

            case "cancelled":
            case "canceled":
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.CANCELLED;

            case "pending":
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.PENDING;

            case "arrived":
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.ARRIVED;

            case "noshow":
            case "no-show":
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.NOSHOW;

            default:
                return org.hl7.fhir.r4.model.Appointment
                        .AppointmentStatus.PROPOSED;
        }
    }

    private Date parseAppointmentDateTime(
            String appointmentDate,
            String appointmentTime) {

        if (appointmentDate == null
                || appointmentDate.isBlank()
                || appointmentTime == null
                || appointmentTime.isBlank()) {

            return null;
        }

        String dateTime =
                appointmentDate.trim()
                        + " "
                        + appointmentTime.trim();

        DateTimeFormatter[] formatters = {

                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd HH:mm"
                ),

                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd hh:mm a"
                ),

                DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy HH:mm"
                ),

                DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy hh:mm a"
                )
        };

        for (DateTimeFormatter formatter : formatters) {

            try {

                LocalDateTime localDateTime =
                        LocalDateTime.parse(
                                dateTime,
                                formatter
                        );

                return Date.from(
                        localDateTime
                                .atZone(
                                        ZoneId.systemDefault()
                                )
                                .toInstant()
                );

            } catch (Exception ignored) {

                // Try next date format
            }
        }

        return null;
    }
}