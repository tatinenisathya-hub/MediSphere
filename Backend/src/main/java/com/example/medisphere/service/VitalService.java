package com.example.medisphere.service;

import com.example.medisphere.model.Vital;
import com.example.medisphere.repository.VitalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VitalService {

    private final VitalRepository vitalRepository;

    public VitalService(VitalRepository vitalRepository) {
        this.vitalRepository = vitalRepository;
    }

    public Vital createVital(Vital vital) {

        if (vital.getRecordedAt() == null) {
            vital.setRecordedAt(LocalDateTime.now());
        }

        return vitalRepository.save(vital);
    }

    public List<Vital> getAllVitals() {
        return vitalRepository.findAll();
    }

    public List<Vital> getVitalsByPatientId(String patientId) {
        return vitalRepository.findByPatientId(patientId);
    }

    public Optional<Vital> getVitalById(String id) {
        return vitalRepository.findById(id);
    }

    public Vital updateVital(String id, Vital updatedVital) {

        return vitalRepository.findById(id)
                .map(vital -> {

                    vital.setPatientId(updatedVital.getPatientId());
                    vital.setHeartRate(updatedVital.getHeartRate());
                    vital.setTemperature(updatedVital.getTemperature());
                    vital.setSystolicBloodPressure(
                            updatedVital.getSystolicBloodPressure()
                    );
                    vital.setDiastolicBloodPressure(
                            updatedVital.getDiastolicBloodPressure()
                    );
                    vital.setOxygenSaturation(
                            updatedVital.getOxygenSaturation()
                    );
                    vital.setRespiratoryRate(
                            updatedVital.getRespiratoryRate()
                    );
                    vital.setRecordedAt(updatedVital.getRecordedAt());

                    return vitalRepository.save(vital);
                })
                .orElse(null);
    }

    public boolean deleteVital(String id) {

        if (vitalRepository.existsById(id)) {
            vitalRepository.deleteById(id);
            return true;
        }

        return false;
    }
}