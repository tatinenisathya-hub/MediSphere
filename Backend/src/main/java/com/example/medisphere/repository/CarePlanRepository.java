package com.example.medisphere.repository;

import com.example.medisphere.model.CarePlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CarePlanRepository extends MongoRepository<CarePlan, String> {
    List<CarePlan> findByPatientIdOrderByCreatedAtDesc(String patientId);
}
