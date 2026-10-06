package com.example.medisphere.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // CORS configuration for the React frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend development URLs
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000"
        ));

        // Allowed HTTP methods
        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Allowed request headers
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin"
        ));

        // Headers that the frontend can access
        configuration.setExposedHeaders(List.of(
                "Authorization"
        ));

        // JWT is sent through the Authorization header,
        // so cookies are not required.
        configuration.setAllowCredentials(false);

        // Cache preflight response for one hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Enable CORS
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

            // Disable CSRF for stateless JWT authentication
            .csrf(csrf -> csrf.disable())

            // Do not create HTTP sessions
            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Return 401 for unauthenticated requests
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(
                    new org.springframework.security.web.authentication
                        .HttpStatusEntryPoint(
                            HttpStatus.UNAUTHORIZED
                        )
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()

                // Public authentication endpoints
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/register",
                    "/api/auth/login"
                ).permitAll()

                // Public Swagger documentation
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()

                // Only ADMIN can create doctor login accounts
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/admin/doctor-accounts"
                ).hasRole("ADMIN")

                // Only ADMIN can create doctor records
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/doctors"
                ).hasRole("ADMIN")

                // Only ADMIN can update doctor records
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/doctors/**"
                ).hasRole("ADMIN")

                // Only ADMIN can delete doctor records
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/doctors/**"
                ).hasRole("ADMIN")

                // Authenticated users can view doctors
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/doctors",
                    "/api/doctors/**"
                ).hasAnyRole(
                    "PATIENT",
                    "DOCTOR",
                    "ADMIN"
                )

                // Authenticated users can request FHIR records.
                // Patient ownership and doctor assignment are
                // checked in the FHIR service.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/fhir/Patient/**"
                ).hasAnyRole(
                    "PATIENT",
                    "DOCTOR",
                    "ADMIN"
                )

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Add JWT authentication filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}