package com.example.medisphere.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.medisphere.model.User;
import com.example.medisphere.service.DoctorAccountService;

@RestController
@RequestMapping("/api/admin")
public class DoctorAccountController {

    private final DoctorAccountService doctorAccountService;

    public DoctorAccountController(
            DoctorAccountService doctorAccountService) {
        this.doctorAccountService = doctorAccountService;
    }

    @PostMapping("/doctor-accounts")
    public ResponseEntity<?> createDoctorAccount(
            @RequestBody DoctorAccountRequest request) {

        try {
            User user = doctorAccountService.createDoctorAccount(
                    request.getDoctorId(),
                    request.getPassword()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Doctor account created successfully",
                            "userId", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "role", user.getRole(),
                            "doctorId", user.getDoctorId()
                    ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    public static class DoctorAccountRequest {

        private String doctorId;
        private String password;

        public String getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(String doctorId) {
            this.doctorId = doctorId;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}