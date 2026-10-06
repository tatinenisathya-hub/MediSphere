package com.example.medisphere.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/setup")
public class AdminSetupController {

    private final AuthService authService;

    @Value("${app.admin.setup-secret:}")
    private String setupSecret;

    public AdminSetupController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/admin")
    public ResponseEntity<String> createInitialAdmin(
            @RequestHeader("X-Setup-Secret") String providedSecret,
            @RequestBody AdminSetupRequest request) {

        if (setupSecret == null || setupSecret.isBlank()
                || !setupSecret.equals(providedSecret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid setup secret");
        }

        try {
            authService.createInitialAdmin(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Initial administrator created successfully");

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    public static class AdminSetupRequest {
        private String name;
        private String email;
        private String password;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}