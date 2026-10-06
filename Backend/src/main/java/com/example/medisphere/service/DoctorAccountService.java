package com.example.medisphere.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.medisphere.model.Doctor;
import com.example.medisphere.model.Role;
import com.example.medisphere.model.User;
import com.example.medisphere.repository.DoctorRepository;
import com.example.medisphere.repository.UserRepository;

@Service
public class DoctorAccountService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorAccountService(
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createDoctorAccount(
            String doctorId,
            String password) {

        if (doctorId == null || doctorId.isBlank()) {
            throw new IllegalArgumentException(
                    "Doctor ID is required");
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }

        // Find the existing doctor record
        Doctor doctor = doctorRepository.findById(doctorId.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Doctor not found"));

        String email = doctor.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Prevent duplicate user accounts
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        // Create a DOCTOR user linked to the doctor record
        User user = new User(
                doctor.getName(),
                email,
                passwordEncoder.encode(password),
                Role.DOCTOR
        );

        user.setDoctorId(doctor.getId());

        return userRepository.save(user);
    }
}