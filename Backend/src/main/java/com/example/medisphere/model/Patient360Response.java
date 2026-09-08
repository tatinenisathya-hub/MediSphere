package com.example.medisphere.model;

import java.util.List;

public class Patient360Response {

    private Patient patient;
    private PatientTwin patientTwin;

    private List<Appointment> appointments;
    private List<Prescription> prescriptions;
    private List<Vital> vitals;
    private List<Doctor> doctors;

    public Patient360Response() {
    }

    public Patient360Response(
            Patient patient,
            PatientTwin patientTwin,
            List<Appointment> appointments,
            List<Prescription> prescriptions,
            List<Vital> vitals,
            List<Doctor> doctors) {

        this.patient = patient;
        this.patientTwin = patientTwin;
        this.appointments = appointments;
        this.prescriptions = prescriptions;
        this.vitals = vitals;
        this.doctors = doctors;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public PatientTwin getPatientTwin() {
        return patientTwin;
    }

    public void setPatientTwin(PatientTwin patientTwin) {
        this.patientTwin = patientTwin;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<Prescription> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public List<Vital> getVitals() {
        return vitals;
    }

    public void setVitals(List<Vital> vitals) {
        this.vitals = vitals;
    }

    public List<Doctor> getDoctors() {
        return doctors;
    }

    public void setDoctors(List<Doctor> doctors) {
        this.doctors = doctors;
    }
}