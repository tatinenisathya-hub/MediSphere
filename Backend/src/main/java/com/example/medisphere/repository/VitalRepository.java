package com.example.medisphere.repository;

import com.example.medisphere.model.Vital;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VitalRepository
        extends MongoRepository<Vital, String> {

    List<Vital> findByPatientId(String patientId);
}