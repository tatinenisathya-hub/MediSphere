package com.example.medisphere.repository;

import com.example.medisphere.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DoctorRepository extends MongoRepository<Doctor, String> {

}