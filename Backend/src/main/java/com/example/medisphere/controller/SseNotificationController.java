package com.example.medisphere.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    public SseEmitter streamNotifications(
            Authentication authentication
    ) {

        /*
         * Authentication is already handled by Spring Security.
         *
         * Only DOCTOR and ADMIN are allowed to receive
         * doctor notification events.
         */
        User user = (User) authentication.getPrincipal();

        if (user.getRole() != Role.DOCTOR &&
            user.getRole() != Role.ADMIN) {

            /*
             * The endpoint is authenticated, but this role
             * is not allowed to subscribe to doctor notifications.
             */
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Patients cannot access doctor notification stream"
            );
        }

        /*
         * Return the emitter directly.
         *
         * The SseNotificationService keeps the emitter alive
         * and sends events asynchronously.
         */
        return sseNotificationService.subscribe();
    }
}