package com.example.medisphere.service;

import com.example.medisphere.model.Doctor;
import com.example.medisphere.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // Add a new doctor
    public Doctor addDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Get all doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Get doctor by ID
    public Optional<Doctor> getDoctorById(String id) {
        return doctorRepository.findById(id);
    }

    // Update doctor
    public Doctor updateDoctor(String id, Doctor updatedDoctor) {

        return doctorRepository.findById(id)
                .map(doctor -> {
                    doctor.setName(updatedDoctor.getName());
                    doctor.setSpecialization(updatedDoctor.getSpecialization());
                    doctor.setPhone(updatedDoctor.getPhone());
                    doctor.setEmail(updatedDoctor.getEmail());

                    return doctorRepository.save(doctor);
                })
                .orElse(null);
    }

    // Delete doctor
    public boolean deleteDoctor(String id) {

        if (doctorRepository.existsById(id)) {
            doctorRepository.deleteById(id);
            return true;
        }

        return false;
    }
}