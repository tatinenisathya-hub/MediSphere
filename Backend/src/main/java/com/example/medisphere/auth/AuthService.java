package com.example.medisphere.auth;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.medisphere.model.Role;
import com.example.medisphere.model.User;
import com.example.medisphere.repository.UserRepository;
import com.example.medisphere.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register a new patient
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        User user = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                Role.PATIENT
        );

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(
                "Registration successful",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                token
        );
    }

    // Login for patients, doctors, and administrators
    public AuthResponse login(AuthRequest request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password"));

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "This account is disabled");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new IllegalArgumentException(
                    "Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }

    // Create the initial administrator account
    public void createInitialAdmin(
            String name,
            String email,
            String password) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Admin name is required");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Admin email is required");
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Admin password must contain at least 8 characters");
        }

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        User admin = new User(
                name.trim(),
                normalizedEmail,
                passwordEncoder.encode(password),
                Role.ADMIN
        );

        userRepository.save(admin);
    }

    // Normalize email addresses
    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}