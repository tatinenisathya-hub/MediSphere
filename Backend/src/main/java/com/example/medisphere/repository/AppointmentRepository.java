package com.example.medisphere.repository;

import com.example.medisphere.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentRepository
        extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientId(String patientId);
}