package com.example.medisphere.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.medisphere.model.WearableDevice;

public interface WearableDeviceRepository extends MongoRepository<WearableDevice, String> {

    Optional<WearableDevice> findByDeviceId(String deviceId);

    List<WearableDevice> findByPatientId(String patientId);
}