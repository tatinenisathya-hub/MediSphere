package com.example.medisphere.repository;

import com.example.medisphere.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppointmentRepository
        extends MongoRepository<Appointment, String> {

}