package com.example.medisphere.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.medisphere.model.Role;
import com.example.medisphere.model.User;
import com.example.medisphere.service.SseNotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:3000"
        }
)
public class SseNotificationController {

    private final SseNotificationService sseNotificationService;

    @GetMapping(
            value = "/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public ResponseEntity<?> streamNotifications(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        // Only DOCTOR and ADMIN can subscribe to doctor notifications
        if (user.getRole() != Role.DOCTOR &&
            user.getRole() != Role.ADMIN) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Patients cannot access doctor notification stream");
        }

        SseEmitter emitter =
                sseNotificationService.subscribe();

        return ResponseEntity.ok(emitter);
    }
}