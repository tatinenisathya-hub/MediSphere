package com.example.medisphere.service;

import ca.uhn.fhir.context.FhirContext;

import com.example.medisphere.model.Prescription;
import com.example.medisphere.repository.PrescriptionRepository;

import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.MedicationRequest;
import org.hl7.fhir.r4.model.Reference;

import org.springframework.stereotype.Service;

@Service
public class FhirMedicationRequestService {

    private final PrescriptionRepository prescriptionRepository;
    private final FhirContext fhirContext;

    public FhirMedicationRequestService(
            PrescriptionRepository prescriptionRepository) {

        this.prescriptionRepository =
                prescriptionRepository;

        this.fhirContext = FhirContext.forR4();
    }

    public String getFhirMedicationRequest(
            String prescriptionId) {

        Prescription prescription =
                prescriptionRepository
                        .findById(prescriptionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Prescription not found with ID: "
                                                + prescriptionId
                                )
                        );

        MedicationRequest medicationRequest =
                new MedicationRequest();

        // FHIR Resource ID
        medicationRequest.setId(
                prescription.getId()
        );

        // Prescription Status
        medicationRequest.setStatus(
                MedicationRequest
                        .MedicationRequestStatus.ACTIVE
        );

        // Prescription Intent
        medicationRequest.setIntent(
                MedicationRequest
                        .MedicationRequestIntent.ORDER
        );

        // Patient Reference
        if (prescription.getPatientId() != null
                && !prescription.getPatientId().isBlank()) {

            medicationRequest.setSubject(
                    new Reference(
                            "Patient/"
                                    + prescription.getPatientId()
                    )
            );
        }

        // Doctor / Practitioner Reference
        if (prescription.getDoctorId() != null
                && !prescription.getDoctorId().isBlank()) {

            medicationRequest.setRequester(
                    new Reference(
                            "Practitioner/"
                                    + prescription.getDoctorId()
                    )
            );
        }

        // Appointment / Encounter Reference
        if (prescription.getAppointmentId() != null
                && !prescription.getAppointmentId().isBlank()) {

            medicationRequest.setEncounter(
                    new Reference(
                            "Appointment/"
                                    + prescription.getAppointmentId()
                    )
            );
        }

        // Medicine Name
        if (prescription.getMedicineName() != null
                && !prescription.getMedicineName().isBlank()) {

            CodeableConcept medication =
                    new CodeableConcept();

            medication.setText(
                    prescription.getMedicineName()
            );

            medicationRequest.setMedication(
                    medication
            );
        }

        // Dosage and Instructions
        String dosageText = "";

        if (prescription.getDosage() != null
                && !prescription.getDosage().isBlank()) {

            dosageText =
                    "Dosage: "
                            + prescription.getDosage();
        }

        if (prescription.getInstructions() != null
                && !prescription.getInstructions().isBlank()) {

            if (!dosageText.isEmpty()) {
                dosageText += ". ";
            }

            dosageText +=
                    "Instructions: "
                            + prescription.getInstructions();
        }

        if (!dosageText.isEmpty()) {

            medicationRequest
                    .addDosageInstruction()
                    .setText(dosageText);
        }

        // Convert FHIR resource to JSON
        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(
                        medicationRequest
                );
    }
}