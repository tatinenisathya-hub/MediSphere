package com.example.medisphere.service;

import ca.uhn.fhir.context.FhirContext;

import com.example.medisphere.model.Patient;
import com.example.medisphere.model.User;
import com.example.medisphere.model.Role;
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
     * Retrieves a FHIR R4 Patient resource after
     * verifying the authenticated user's permissions.
     *
     * ADMIN:
     * Can access all patient records.
     *
     * PATIENT:
     * Can access only their own patient record.
     *
     * DOCTOR:
     * Can access only patients assigned to them.
     */
    public String getFhirPatient(String patientId, User user) {

        // Verify authenticated user.
        if (user == null || user.getRole() == null) {
            throw new SecurityException(
                    "Authenticated user or role is missing"
            );
        }

        // Find patient.
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found")
                );

        // ADMIN can access all patient records.
        if (user.getRole() == Role.ADMIN) {
            return convertToFhir(patient);
        }

        // PATIENT can access only their own record.
        if (user.getRole() == Role.PATIENT) {

            if (user.getPatientId() == null
                    || !user.getPatientId().equals(patientId)) {

                throw new SecurityException(
                        "You are not authorized to access this patient"
                );
            }

            return convertToFhir(patient);
        }

       // DOCTOR can access only patients assigned to them.
if (user.getRole() == Role.DOCTOR) {

    String userDoctorId = user.getDoctorId();
    String patientDoctorId = patient.getDoctorId();

    System.out.println("----- DOCTOR ACCESS DEBUG -----");
    System.out.println("User Doctor ID: [" + userDoctorId + "]");
    System.out.println("Patient Doctor ID: [" + patientDoctorId + "]");
    System.out.println("User Doctor ID length: "
            + (userDoctorId == null ? "null" : userDoctorId.length()));
    System.out.println("Patient Doctor ID length: "
            + (patientDoctorId == null ? "null" : patientDoctorId.length()));

    boolean isAssigned =
            userDoctorId != null
            && patientDoctorId != null
            && userDoctorId.trim().equals(patientDoctorId.trim());

    System.out.println("Doctor IDs match: " + isAssigned);

    if (!isAssigned) {
        throw new SecurityException(
                "You are not authorized to access this patient"
        );
    }

    return convertToFhir(patient);
}
        // Deny any other role.
        throw new SecurityException("Access denied");
    }

    /**
     * Converts a MediSphere Patient into
     * a FHIR R4 Patient resource.
     */
    private String convertToFhir(Patient patient) {

        org.hl7.fhir.r4.model.Patient fhirPatient =
                new org.hl7.fhir.r4.model.Patient();

        // FHIR Patient ID
        fhirPatient.setId(patient.getId());

        // Patient Name
        HumanName humanName = fhirPatient.addName();
        humanName.setText(patient.getName());

        // Patient Gender
        if (patient.getGender() != null
                && !patient.getGender().isBlank()) {

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

        // Phone Number
        if (patient.getPhone() != null
                && !patient.getPhone().isBlank()) {

            ContactPoint phone = fhirPatient.addTelecom();

            phone.setSystem(
                    ContactPoint.ContactPointSystem.PHONE
            );

            phone.setValue(patient.getPhone());
        }

        // Email
        if (patient.getEmail() != null
                && !patient.getEmail().isBlank()) {

            ContactPoint email = fhirPatient.addTelecom();

            email.setSystem(
                    ContactPoint.ContactPointSystem.EMAIL
            );

            email.setValue(patient.getEmail());
        }

        // Convert FHIR resource to JSON
        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(fhirPatient);
    }
}