package com.example.medisphere.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.medisphere.model.DoctorNotification;
import com.example.medisphere.model.Role;
import com.example.medisphere.model.User;
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
    public ResponseEntity<?> getAllNotifications(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        // Only ADMIN and DOCTOR can access doctor notifications
        if (user.getRole() != Role.ADMIN &&
            user.getRole() != Role.DOCTOR) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Patients cannot access doctor notifications");
        }

        List<DoctorNotification> notifications =
                notificationRepository
                        .findAllByOrderByReceivedAtDesc();

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatientId(
            @PathVariable String patientId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        // Only ADMIN and DOCTOR can access doctor notifications
        if (user.getRole() != Role.ADMIN &&
            user.getRole() != Role.DOCTOR) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Patients cannot access doctor notifications");
        }

        List<DoctorNotification> notifications =
                notificationRepository
                        .findByPatientIdOrderByReceivedAtDesc(patientId);

        return ResponseEntity.ok(notifications);
    }
}