package com.example.medisphere.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "patient_twins")
public class PatientTwin {

    @Id
    private String id;

    private String patientId;

    private String patientName;

    private String email;

    private String phone;

    private String gender;

    private List<String> appointmentIds;

    private List<String> prescriptionIds;

    public PatientTwin() {
    }

    public PatientTwin(
            String patientId,
            String patientName,
            String email,
            String phone,
            String gender,
            List<String> appointmentIds,
            List<String> prescriptionIds) {

        this.patientId = patientId;
        this.patientName = patientName;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
        this.appointmentIds = appointmentIds;
        this.prescriptionIds = prescriptionIds;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public List<String> getAppointmentIds() {
        return appointmentIds;
    }

    public void setAppointmentIds(List<String> appointmentIds) {
        this.appointmentIds = appointmentIds;
    }

    public List<String> getPrescriptionIds() {
        return prescriptionIds;
    }

    public void setPrescriptionIds(List<String> prescriptionIds) {
        this.prescriptionIds = prescriptionIds;
    }
}