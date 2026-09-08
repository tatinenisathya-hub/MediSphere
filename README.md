# MediSphere Healthcare Management System

MediSphere is a full-stack healthcare management system developed as an
Infosys Springboard internship project.

The system integrates patient management, HL7 FHIR R4, MongoDB patient
digital twins, Patient 360, consent management, wearable health data,
Apache Kafka, and an Android application using Health Connect.

## Project Objectives

1.  Connect healthcare systems using FHIR.
2.  Store patient digital twins in MongoDB.
3.  Connect wearable devices and ingest health data.
4.  Create a Patient 360 dashboard.
5.  Manage patient consent.

## Key Features

-   **Patient Management** --- Create, view, update, and delete patient
    records.
-   **Doctor Management** --- Manage doctor details and specializations.
-   **Appointment Management** --- Manage patient-doctor appointments
    and FHIR Appointment resources.
-   **Prescription Management** --- Manage prescriptions and FHIR
    MedicationRequest resources.
-   **Vital Monitoring** --- Store heart rate, temperature, blood
    pressure, oxygen saturation, respiratory rate, source, and device
    information.
-   **FHIR R4 Integration** --- Support Patient, Practitioner,
    Appointment, MedicationRequest, and Observation resources.
-   **External FHIR Integration** --- Create and retrieve resources from
    an external FHIR R4 server.
-   **Patient Digital Twin** --- Maintain an aggregated representation
    of patient-related healthcare records.
-   **Patient 360 Dashboard** --- Display patient profile, digital twin
    status, vitals, appointments, prescriptions, and doctors.
-   **Consent Management** --- Manage patient consent and require active
    `WEARABLE_DATA` consent for wearable ingestion.
-   **Wearable Integration** --- Receive health data through Android
    Health Connect.
-   **Kafka Pipeline** --- Process wearable vital events through the
    `wearable-vitals` Kafka topic.

## System Architecture

``` text
Redmi Watch
    ↓
Mi Fitness
    ↓
Health Connect
    ↓
MediSphere Android App
    ↓
Apache Kafka
    ↓
Spring Boot Backend
    ↓
MongoDB
    ↓
Patient 360 Dashboard

Spring Boot Backend
    ↓
FHIR R4
    ↓
External FHIR Server
```

## Wearable Data Flow

``` text
Wearable Device
      ↓
Mi Fitness
      ↓
Health Connect
      ↓
MediSphere Android App
      ↓
Wearable Vital Event
      ↓
Apache Kafka
      ↓
Spring Boot Kafka Consumer
      ↓
Consent + Device Validation
      ↓
Vital Record
      ↓
MongoDB
      ↓
Patient 360
```

The backend validates that the wearable is connected, assigned to the
patient, the patient exists, and the required `WEARABLE_DATA` consent is
active.

The current real-device integration was tested with a Redmi Watch 5 Lite
through Mi Fitness and Health Connect. Only values actually available
from the data source are stored; unsupported measurements are not
fabricated.

## FHIR Integration

### Internal FHIR Endpoints

  Resource            Endpoint
  ------------------- ----------------------------------------
  Patient             `GET /api/fhir/Patient/{id}`
  Practitioner        `GET /api/fhir/Practitioner/{id}`
  Appointment         `GET /api/fhir/Appointment/{id}`
  MedicationRequest   `GET /api/fhir/MedicationRequest/{id}`
  Vital Observation   `GET /api/fhir/Observation/vital/{id}`

The configured development external FHIR server is:

``` text
https://hapi.fhir.org/baseR4
```

> The public HAPI FHIR test server is intended for testing and
> demonstration, not production storage of patient or confidential
> information.

### Vital FHIR Codes

  Vital                      LOINC
  -------------------------- -----------
  Heart rate                 `8867-4`
  Body temperature           `8310-5`
  Blood pressure panel       `85354-9`
  Systolic blood pressure    `8480-6`
  Diastolic blood pressure   `8462-4`
  Oxygen saturation          `2708-6`
  Respiratory rate           `9279-1`

## Technology Stack

  Layer                         Technology
  ----------------------------- ----------------------------------
  Frontend                      React, Vite
  Backend                       Spring Boot, Java
  Database                      MongoDB
  Messaging                     Apache Kafka
  Healthcare Interoperability   HL7 FHIR R4
  FHIR Library                  HAPI FHIR
  Mobile                        Android, Kotlin, Jetpack Compose
  Health Data                   Android Health Connect
  Backend Build                 Maven
  Mobile Build                  Gradle

## Project Structure

``` text
MediSphere/
├── Backend/
├── Frontend/
├── MediSphereMobile/
├── .gitignore
└── README.md
```

## Backend Setup

### Prerequisites

-   Java 20
-   MongoDB
-   Apache Kafka
-   Node.js and npm
-   Android Studio for the mobile application

### MongoDB

The backend uses:

``` text
mongodb://localhost:27017/medisphere_db
```

Make sure MongoDB is running.

### Kafka

The backend is configured for:

``` text
localhost:9092
```

The wearable event topic is:

``` text
wearable-vitals
```

### Start Backend

``` powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

Backend:

``` text
http://localhost:8080
```

## Frontend Setup

``` powershell
cd Frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

## Android Application

Open `MediSphereMobile/` in Android Studio.

The application uses Kotlin, Jetpack Compose, and Health Connect, with
minimum SDK 28.

For a physical Android device, ADB reverse port forwarding can expose
the local backend:

``` powershell
.db.exe -s <DEVICE_SERIAL> reverse tcp:8080 tcp:8080
```

## Patient Digital Twin

``` text
Patient
  ├── Appointments
  ├── Prescriptions
  └── Vitals
          ↓
   Patient Digital Twin
          ↓
      Patient 360
```

The digital twin maintains references to related healthcare records.

## Important Security Notes

-   Do not commit passwords, API keys, tokens, or other secrets.
-   Do not place real patient-identifying information in the repository.
-   The public external FHIR server is for testing/demo purposes and
    should not be used for production PHI.
-   Generated build files, IDE files, local configuration, and other
    development artifacts are excluded through `.gitignore`.

## Milestone 1 Status

-   [x] FHIR integration
-   [x] External FHIR server communication
-   [x] MongoDB patient digital twins
-   [x] Wearable device management
-   [x] Health Connect integration
-   [x] Kafka wearable event pipeline
-   [x] Patient 360 dashboard
-   [x] Patient consent management
-   [x] Patient management
-   [x] Doctor management
-   [x] Appointment management
-   [x] Prescription management
-   [x] Vital management
-   [x] Android mobile application

## Future Enhancements

-   Role-based authentication and authorization
-   Additional wearable data types
-   Advanced patient analytics
-   Healthcare alerts and notifications
-   Additional FHIR resource types
-   Production-grade security and privacy controls
-   Cloud deployment
-   Automated testing and CI/CD
-   Enhanced clinical decision-support capabilities

## Author

**MediSphere Healthcare Management System**

Developed as part of an **Infosys Springboard Internship Project**.

## License

This project is developed for educational and internship-project
purposes.
