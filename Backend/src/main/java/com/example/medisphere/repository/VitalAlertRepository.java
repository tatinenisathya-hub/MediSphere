package com.example.medisphere.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.medisphere.model.VitalAlert;

public interface VitalAlertRepository
        extends MongoRepository<VitalAlert, String> {

    List<VitalAlert> findByPatientIdOrderByCreatedAtDesc(
            String patientId
    );

    List<VitalAlert> findByStatusOrderByCreatedAtDesc(
            String status
    );

    List<VitalAlert> findAllByOrderByCreatedAtDesc();
}