package com.example.medisphere.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.medisphere.model.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs) {

        this.secretKey = Keys.hmacShaKeyFor(
                java.util.Base64.getDecoder().decode(secret));

        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {

        Date now = new Date();
        Date expiration = new Date(
                now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        try {
            String userId = extractUserId(token);

            return userId.equals(user.getId())
                    && user.isEnabled();
        } catch (io.jsonwebtoken.JwtException
                 | IllegalArgumentException ex) {
            return false;
        }
    }
}