package com.example.medisphere.controller;

import com.example.medisphere.model.Appointment;
import com.example.medisphere.service.AppointmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Create appointment
    @PostMapping
    public Appointment createAppointment(
            @RequestBody Appointment appointment) {

        return appointmentService.createAppointment(appointment);
    }

    // Get all appointments
    @GetMapping
    public List<Appointment> getAllAppointments() {

        return appointmentService.getAllAppointments();
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(
            @PathVariable String id) {

        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update appointment
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable String id,
            @RequestBody Appointment appointment) {

        Appointment updatedAppointment =
                appointmentService.updateAppointment(id, appointment);

        if (updatedAppointment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedAppointment);
    }

    // Delete appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable String id) {

        boolean deleted = appointmentService.deleteAppointment(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}