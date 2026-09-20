package com.example.medisphere.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.medisphere.model.DoctorNotification;

public interface DoctorNotificationRepository
        extends MongoRepository<DoctorNotification, String> {

    List<DoctorNotification>
    findAllByOrderByReceivedAtDesc();

    List<DoctorNotification>
    findByPatientIdOrderByReceivedAtDesc(String patientId);

    boolean existsByNotificationId(String notificationId);
}