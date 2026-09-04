package com.example.medisphere.service;

import ca.uhn.fhir.context.FhirContext;
import com.example.medisphere.model.Doctor;
import com.example.medisphere.repository.DoctorRepository;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Practitioner;
import org.springframework.stereotype.Service;

@Service
public class FhirPractitionerService {

    private final DoctorRepository doctorRepository;
    private final FhirContext fhirContext;

    public FhirPractitionerService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
        this.fhirContext = FhirContext.forR4();
    }

    /**
     * Converts a MediSphere Doctor into a FHIR R4 Practitioner resource.
     */
    public String getFhirPractitioner(String doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found with id: " + doctorId
                        )
                );

        Practitioner practitioner = new Practitioner();

        // FHIR Practitioner ID
        practitioner.setId(doctor.getId());

        // Doctor name
        if (doctor.getName() != null && !doctor.getName().isBlank()) {

            HumanName humanName = practitioner.addName();
            humanName.setText(doctor.getName());
        }

        // Phone number
        if (doctor.getPhone() != null && !doctor.getPhone().isBlank()) {

            practitioner.addTelecom()
                    .setSystem(ContactPoint.ContactPointSystem.PHONE)
                    .setValue(doctor.getPhone());
        }

        // Email address
        if (doctor.getEmail() != null && !doctor.getEmail().isBlank()) {

            practitioner.addTelecom()
                    .setSystem(ContactPoint.ContactPointSystem.EMAIL)
                    .setValue(doctor.getEmail());
        }

        // Doctor specialization
        if (doctor.getSpecialization() != null
                && !doctor.getSpecialization().isBlank()) {

            CodeableConcept qualification = new CodeableConcept();
            qualification.setText(doctor.getSpecialization());

            practitioner.addQualification()
                    .setCode(qualification);
        }

        // Convert Practitioner resource to FHIR JSON
        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(practitioner);
    }
}