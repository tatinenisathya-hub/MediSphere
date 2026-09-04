package com.example.medisphere.repository;

import com.example.medisphere.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository
        extends MongoRepository<Prescription, String> {

}