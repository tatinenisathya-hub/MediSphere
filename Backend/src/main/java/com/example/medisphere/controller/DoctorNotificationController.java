package com.example.medisphere.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.medisphere.model.DoctorNotification;
import com.example.medisphere.repository.DoctorNotificationRepository;

@RestController
@RequestMapping("/api/doctor-notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorNotificationController {

    private final DoctorNotificationRepository notificationRepository;

    public DoctorNotificationController(
            DoctorNotificationRepository notificationRepository) {

        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<DoctorNotification> getAllNotifications() {

        return notificationRepository
                .findAllByOrderByReceivedAtDesc();
    }

    @GetMapping("/patient/{patientId}")
    public List<DoctorNotification> getByPatientId(
            @PathVariable String patientId) {

        return notificationRepository
                .findByPatientIdOrderByReceivedAtDesc(patientId);
    }
}