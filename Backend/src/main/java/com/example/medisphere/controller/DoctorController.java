package com.example.medisphere.controller;

import com.example.medisphere.model.Doctor;
import com.example.medisphere.service.DoctorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Create a new doctor
    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.addDoctor(doctor);
    }

    // Get all doctors
    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    // Get doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(
            @PathVariable String id) {

        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update doctor
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable String id,
            @RequestBody Doctor doctor) {

        Doctor updatedDoctor =
                doctorService.updateDoctor(id, doctor);

        if (updatedDoctor == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedDoctor);
    }

    // Delete doctor
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(
            @PathVariable String id) {

        boolean deleted = doctorService.deleteDoctor(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}