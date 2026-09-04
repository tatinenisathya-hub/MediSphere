package com.example.medisphere.service;

import ca.uhn.fhir.context.FhirContext;

import com.example.medisphere.model.Vital;
import com.example.medisphere.repository.VitalRepository;

import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.DateTimeType;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Quantity;
import org.hl7.fhir.r4.model.Reference;

import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Date;

@Service
public class FhirObservationService {

    private final VitalRepository vitalRepository;

    private final FhirContext fhirContext;

    public FhirObservationService(
            VitalRepository vitalRepository) {

        this.vitalRepository = vitalRepository;

        this.fhirContext = FhirContext.forR4();
    }

    /**
     * Converts one MediSphere Vital record
     * into a FHIR R4 Bundle containing
     * multiple Observation resources.
     */
    public String getFhirObservations(
            String vitalId) {

        Vital vital = vitalRepository
                .findById(vitalId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vital not found with ID: "
                                        + vitalId
                        )
                );

        Bundle bundle = new Bundle();

        bundle.setType(
                Bundle.BundleType.COLLECTION
        );

        /*
         * Heart Rate
         */
        if (vital.getHeartRate() != null) {

            bundle.addEntry()
                    .setResource(
                            createObservation(
                                    "Heart rate",
                                    "8867-4",
                                    vital.getHeartRate(),
                                    "beats/minute",
                                    "beats/min",
                                    vital
                            )
                    );
        }

        /*
         * Body Temperature
         */
        if (vital.getTemperature() != null) {

            bundle.addEntry()
                    .setResource(
                            createObservation(
                                    "Body temperature",
                                    "8310-5",
                                    vital.getTemperature(),
                                    "degrees Celsius",
                                    "°C",
                                    vital
                            )
                    );
        }

        /*
         * Blood Pressure
         *
         * Uses one Observation
         * with systolic and diastolic components.
         */
        if (vital.getSystolicBloodPressure() != null
                || vital.getDiastolicBloodPressure() != null) {

            bundle.addEntry()
                    .setResource(
                            createBloodPressureObservation(
                                    vital
                            )
                    );
        }

        /*
         * Oxygen Saturation
         */
        if (vital.getOxygenSaturation() != null) {

            bundle.addEntry()
                    .setResource(
                            createObservation(
                                    "Oxygen saturation",
                                    "2708-6",
                                    vital.getOxygenSaturation(),
                                    "percent",
                                    "%",
                                    vital
                            )
                    );
        }

        /*
         * Respiratory Rate
         */
        if (vital.getRespiratoryRate() != null) {

            bundle.addEntry()
                    .setResource(
                            createObservation(
                                    "Respiratory rate",
                                    "9279-1",
                                    vital.getRespiratoryRate(),
                                    "breaths/minute",
                                    "breaths/min",
                                    vital
                            )
                    );
        }

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(bundle);
    }


    /**
     * Creates a standard FHIR Observation.
     */
    private Observation createObservation(

            String displayName,
            String loincCode,
            Double value,
            String unit,
            String unitSymbol,
            Vital vital) {

        Observation observation =
                new Observation();

        observation.setStatus(
                Observation.ObservationStatus.FINAL
        );

        /*
         * Observation Code
         */
        observation.getCode()
                .addCoding()
                .setSystem(
                        "http://loinc.org"
                )
                .setCode(loincCode)
                .setDisplay(displayName);

        /*
         * Patient Reference
         */
        if (vital.getPatientId() != null
                && !vital.getPatientId().isBlank()) {

            observation.setSubject(
                    new Reference(
                            "Patient/"
                                    + vital.getPatientId()
                    )
            );
        }

        /*
         * Observation Date and Time
         */
        if (vital.getRecordedAt() != null) {

            Date recordedDate =
                    Date.from(
                            vital.getRecordedAt()
                                    .atZone(
                                            ZoneId.systemDefault()
                                    )
                                    .toInstant()
                    );

            observation.setEffective(
                    new DateTimeType(
                            recordedDate
                    )
            );
        }

        /*
         * Observation Value
         */
        observation.setValue(
                new Quantity()
                        .setValue(value)
                        .setUnit(unitSymbol)
                        .setSystem(
                                "http://unitsofmeasure.org"
                        )
                        .setCode(unit)
        );

        return observation;
    }


    /**
     * Creates a FHIR Blood Pressure Observation.
     */
    private Observation
    createBloodPressureObservation(
            Vital vital) {

        Observation observation =
                new Observation();

        observation.setStatus(
                Observation.ObservationStatus.FINAL
        );

        /*
         * Blood Pressure Code
         */
        observation.getCode()
                .addCoding()
                .setSystem(
                        "http://loinc.org"
                )
                .setCode("85354-9")
                .setDisplay(
                        "Blood pressure panel"
                );

        /*
         * Patient Reference
         */
        if (vital.getPatientId() != null
                && !vital.getPatientId().isBlank()) {

            observation.setSubject(
                    new Reference(
                            "Patient/"
                                    + vital.getPatientId()
                    )
            );
        }

        /*
         * Recorded Date
         */
        if (vital.getRecordedAt() != null) {

            Date recordedDate =
                    Date.from(
                            vital.getRecordedAt()
                                    .atZone(
                                            ZoneId.systemDefault()
                                    )
                                    .toInstant()
                    );

            observation.setEffective(
                    new DateTimeType(
                            recordedDate
                    )
            );
        }

        /*
         * Systolic Blood Pressure
         */
        if (vital.getSystolicBloodPressure()
                != null) {

            observation.addComponent()
                    .getCode()
                    .addCoding()
                    .setSystem(
                            "http://loinc.org"
                    )
                    .setCode("8480-6")
                    .setDisplay(
                            "Systolic blood pressure"
                    );

            Observation.ObservationComponentComponent
                    systolic =

                    observation
                            .getComponent()
                            .get(
                                    observation
                                            .getComponent()
                                            .size() - 1
                            );

            systolic.setValue(
                    new Quantity()
                            .setValue(
                                    vital
                                            .getSystolicBloodPressure()
                            )
                            .setUnit("mmHg")
                            .setSystem(
                                    "http://unitsofmeasure.org"
                            )
                            .setCode("mm[Hg]")
            );
        }

        /*
         * Diastolic Blood Pressure
         */
        if (vital.getDiastolicBloodPressure()
                != null) {

            observation.addComponent()
                    .getCode()
                    .addCoding()
                    .setSystem(
                            "http://loinc.org"
                    )
                    .setCode("8462-4")
                    .setDisplay(
                            "Diastolic blood pressure"
                    );

            Observation.ObservationComponentComponent
                    diastolic =

                    observation
                            .getComponent()
                            .get(
                                    observation
                                            .getComponent()
                                            .size() - 1
                            );

            diastolic.setValue(
                    new Quantity()
                            .setValue(
                                    vital
                                            .getDiastolicBloodPressure()
                            )
                            .setUnit("mmHg")
                            .setSystem(
                                    "http://unitsofmeasure.org"
                            )
                            .setCode("mm[Hg]")
            );
        }

        return observation;
    }
}