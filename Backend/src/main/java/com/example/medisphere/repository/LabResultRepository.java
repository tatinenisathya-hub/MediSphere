package com.example.medisphere.repository;

import com.example.medisphere.model.LabResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LabResultRepository extends MongoRepository<LabResult, String> {

    List<LabResult> findByPatientIdOrderByPerformedAtDesc(String patientId);
}