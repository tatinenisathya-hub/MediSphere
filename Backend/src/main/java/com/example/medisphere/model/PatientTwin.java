package com.example.medisphere.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "patient_twins")
public class PatientTwin {

    @Id
    private String id;

    // ===============================
    // PATIENT INFORMATION
    // ===============================

    private String patientId;

    private String patientName;

    private Integer age;

    private String email;

    private String phone;

    private String gender;

    // ===============================
    // CONNECTED HEALTHCARE RECORDS
    // ===============================

    private List<String> appointmentIds;

    private List<String> prescriptionIds;

    private List<String> vitalIds;

    // ===============================
    // DIGITAL TWIN METADATA
    // ===============================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public PatientTwin() {
        this.appointmentIds = new ArrayList<>();
        this.prescriptionIds = new ArrayList<>();
        this.vitalIds = new ArrayList<>();
    }

    public PatientTwin(
            String patientId,
            String patientName,
            Integer age,
            String email,
            String phone,
            String gender,
            List<String> appointmentIds,
            List<String> prescriptionIds,
            List<String> vitalIds,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.age = age;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
        this.appointmentIds = appointmentIds;
        this.prescriptionIds = prescriptionIds;
        this.vitalIds = vitalIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
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

    public List<String> getVitalIds() {
        return vitalIds;
    }

    public void setVitalIds(List<String> vitalIds) {
        this.vitalIds = vitalIds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}