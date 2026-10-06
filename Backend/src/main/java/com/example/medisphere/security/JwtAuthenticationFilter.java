package com.example.medisphere.security;

import java.io.IOException;
import java.util.List;

import com.example.medisphere.model.User;
import com.example.medisphere.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token: continue. Protected endpoints will require authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        try {
            if (token.isEmpty()) {
                throw new IllegalArgumentException("Empty JWT token");
            }

            String userId = jwtService.extractUserId(token);

            if (userId == null) {
                throw new IllegalArgumentException("Invalid JWT subject");
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                                    System.out.println("Loaded user ID: " + user.getId());
                                    System.out.println("Loaded user email: " + user.getEmail());
                                    System.out.println("Loaded user role: " + user.getRole());
                                    System.out.println("Loaded patient ID: " + user.getPatientId());
                }

                if (user == null
                        || user.getRole() == null
                        || !jwtService.isTokenValid(token, user)) {
                    throw new IllegalArgumentException("Invalid JWT user");
                }

                var authorities = List.of(
                    new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()
                    )
                );

                var authentication =
                    new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        authorities
                    );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        } catch (io.jsonwebtoken.JwtException
                 | IllegalArgumentException ex) {

            // Invalid or expired token
            SecurityContextHolder.clearContext();

            response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                "Invalid or expired JWT token"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}