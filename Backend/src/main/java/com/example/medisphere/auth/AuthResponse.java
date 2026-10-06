package com.example.medisphere.auth;

import com.example.medisphere.model.Role;

public class AuthResponse {

    private String message;
    private String userId;
    private String name;
    private String email;
    private Role role;
    private String token;

    public AuthResponse(
            String message,
            String userId,
            String name,
            String email,
            Role role,
            String token) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}