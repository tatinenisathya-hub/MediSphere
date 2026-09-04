package com.example.medisphere.repository;

import com.example.medisphere.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PrescriptionRepository
        extends MongoRepository<Prescription, String> {

    List<Prescription> findByPatientId(String patientId);
}