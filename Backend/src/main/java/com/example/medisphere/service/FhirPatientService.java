package com.example.medisphere.service;

import ca.uhn.fhir.context.FhirContext;
import com.example.medisphere.model.Patient;
import com.example.medisphere.repository.PatientRepository;

import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.HumanName;

import org.springframework.stereotype.Service;

@Service
public class FhirPatientService {

    private final PatientRepository patientRepository;

    private final FhirContext fhirContext;

    public FhirPatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
        this.fhirContext = FhirContext.forR4();
    }

    /**
     * Converts a MediSphere Patient into
     * a FHIR R4 Patient resource.
     */
    public String getFhirPatient(String patientId) {

        // Find the patient in MongoDB
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with id: " + patientId
                        )
                );

        // Create FHIR Patient
        org.hl7.fhir.r4.model.Patient fhirPatient =
                new org.hl7.fhir.r4.model.Patient();

        // -----------------------------------------
        // FHIR Patient ID
        // -----------------------------------------
        fhirPatient.setId(patient.getId());

        // -----------------------------------------
        // Patient Name
        // -----------------------------------------
        HumanName humanName = fhirPatient.addName();
        humanName.setText(patient.getName());

        // -----------------------------------------
        // Patient Gender
        // -----------------------------------------
        if (patient.getGender() != null &&
                !patient.getGender().isBlank()) {

            switch (patient.getGender().trim().toLowerCase()) {

                case "male":
                    fhirPatient.setGender(
                            AdministrativeGender.MALE
                    );
                    break;

                case "female":
                    fhirPatient.setGender(
                            AdministrativeGender.FEMALE
                    );
                    break;

                case "other":
                    fhirPatient.setGender(
                            AdministrativeGender.OTHER
                    );
                    break;

                default:
                    fhirPatient.setGender(
                            AdministrativeGender.UNKNOWN
                    );
                    break;
            }
        }

        // -----------------------------------------
        // Phone Number
        // -----------------------------------------
        if (patient.getPhone() != null &&
                !patient.getPhone().isBlank()) {

            ContactPoint phone =
                    fhirPatient.addTelecom();

            phone.setSystem(
                    ContactPoint.ContactPointSystem.PHONE
            );

            phone.setValue(patient.getPhone());
        }

        // -----------------------------------------
        // Email
        // -----------------------------------------
        if (patient.getEmail() != null &&
                !patient.getEmail().isBlank()) {

            ContactPoint email =
                    fhirPatient.addTelecom();

            email.setSystem(
                    ContactPoint.ContactPointSystem.EMAIL
            );

            email.setValue(patient.getEmail());
        }

        // -----------------------------------------
        // Convert FHIR resource to JSON
        // -----------------------------------------
        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(fhirPatient);
    }
}