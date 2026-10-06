# MediSphere Healthcare Management System

MediSphere is a full-stack healthcare management system developed as an Infosys Springboard internship project.

The system integrates patient management, HL7 FHIR R4, MongoDB patient digital twins, Patient 360, consent management, wearable health data, Apache Kafka, and an Android application using Health Connect.

It also provides JWT-based authentication and role-based access control (RBAC), AI-powered cardiovascular and diabetes risk prediction using federated learning, real-time health monitoring, and AI-assisted care plan generation with provider approval, intervention adherence tracking, and health outcome monitoring.
## Project Objectives

1. Authenticate patients, doctors, and administrators using JWT-based authentication.
2. Enforce role-based and ownership-based access to protected healthcare APIs.
3. Connect healthcare systems using HL7 FHIR R4.
4. Store patient digital twins and healthcare records in MongoDB.
5. Integrate wearable devices through Android Health Connect.
6. Ingest and process wearable health data using Apache Kafka.
7. Create a Patient 360 dashboard for comprehensive patient monitoring.
8. Manage patient consent and validate access to wearable health data.
9. Detect abnormal vital measurements using configurable alert thresholds.
10. Provide real-time doctor notifications through Kafka and Server-Sent Events (SSE).
11. Provide AI-based cardiovascular and diabetes risk prediction.
12. Apply federated learning so participating hospitals can train models without sharing raw patient training data.
13. Provide explainable AI using SHAP and validated risk outputs.
14. Maintain AI risk history and display risk trends for selected patients.
15. Generate personalized care plan drafts based on patient risk predictions and predefined guideline rules.
16. Enable healthcare providers to review and approve care plans.
17. Track patient adherence to care plan interventions.
18. Record and compare health outcome measurements over time.

## Key Features

- **Patient Management** --- Create, view, update, and delete patient records.

- **Doctor Management** --- Manage doctor details and specializations.

- **Appointment Management** --- Manage patient-doctor appointments and FHIR Appointment resources.

- **Prescription Management** --- Manage prescriptions and FHIR MedicationRequest resources.

- **Vital Monitoring** --- Store heart rate, temperature, blood pressure, oxygen saturation, respiratory rate, source, and device information.

- **FHIR R4 Integration** --- Support Patient, Practitioner, Appointment, MedicationRequest, and Observation resources.

- **External FHIR Integration** --- Create and retrieve resources from an external FHIR R4 server.

- **Patient Digital Twin** --- Maintain an aggregated representation of patient-related healthcare records.

- **Patient 360 Dashboard** --- Display patient profile, digital twin status, vitals, appointments, prescriptions, and doctors.

- **Consent Management** --- Manage patient consent and require active `WEARABLE_DATA` consent for wearable ingestion.

- **Authentication & RBAC** --- Provide JWT-based login and patient registration, with `PATIENT`, `DOCTOR`, and `ADMIN` roles, protected APIs, patient ownership checks, and doctor-assignment checks.

- **Wearable Integration** --- Receive health data through `Android Health Connect`.

- **Kafka Pipeline** --- Process wearable vital events through the `wearable-vitals` Kafka topic.

- **AI Risk Prediction** --- Predict cardiovascular and diabetes risk using federated machine learning models.

- **Federated Learning** --- Train participating hospital models locally and aggregate model updates without centralizing raw training data.

- **SHAP Explainability** --- Provide feature-level explanations for cardiovascular and diabetes risk predictions.

- **Risk Calibration** --- Apply probability calibration to the cardiovascular risk model for improved reliability of predicted risk probabilities.

- **AI Risk History** --- Store previous AI risk predictions for a patient and display changes between predictions.

- **AI Risk Trend** --- Display latest risk, previous risk, percentage change, trend direction, model version, and validation accuracy.

- **Clinical Guideline Validation** --- Validate AI outputs against defined clinical guideline checks.

- **AI-Assisted Care Plans** — Generate care plan drafts using patient risk predictions and predefined guideline rules.

- **Provider Review and Approval** — Allow doctors to review and approve generated care plans.

- **Intervention Adherence Tracking** — Track interventions using NOT_STARTED, IN_PROGRESS, COMPLETED, and SKIPPED statuses.

- **Health Outcome Tracking** — Record health measurements, values, units, notes, and timestamps.

- **Outcome Comparison** — Compare the latest and previous measurements for the same metric and unit.

## System Architecture

### Main Healthcare Data Flow

```text
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
```

### FHIR Integration

```text
Spring Boot Backend
        ↓
      FHIR R4
        ↓
External FHIR Server
```

### AI Risk Prediction Flow

```text
Patient Data
      ↓
Spring Boot AI Integration
      ↓
FastAPI AI Service
      ↓
Federated Risk Models
      ├── Cardiovascular Risk Model
      └── Diabetes Risk Model
      ↓
SHAP Explainability
      ↓
Risk Prediction + Validation
      ↓
AI Risk History
      ↓
Patient AI Risk Dashboard
```

### Wearable Data Flow

```text
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

The backend validates that the wearable is connected, assigned to the patient, the patient exists, and the required WEARABLE_DATA consent is active.

The current real-device integration was tested with a `Redmi Watch 5 Lite` through `Mi Fitness` and `Health Connect`. Only values actually available from the data source are stored; unsupported measurements are not fabricated.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Spring Boot, Java |
| AI Service | Python, FastAPI |
| AI/ML | TensorFlow, TensorFlow Federated |
| Explainability | SHAP |
| Database | MongoDB |
| Messaging | Apache Kafka |
| Healthcare Interoperability | HL7 FHIR R4 |
| FHIR Library | HAPI FHIR |
| Mobile | Android, Kotlin, Jetpack Compose |
| Health Data | Android Health Connect |
| Backend Build | Maven |
| Mobile Build | Gradle |

## Key Project Versions

| Component | Current Project Version / Configuration |
|---|---|
| Spring Boot | 4.1.1 |
| Java | 20 compiler target |
| JJWT | 0.12.6 |
| HAPI FHIR | 8.10.1 |
| React | 19.2.8 |
| Vite | 8.2.2 |
| Axios | 1.20.0 |
| Python TensorFlow | 2.14.1 |
| TensorFlow Federated | 0.64.0 |
| SHAP | 0.45.1 |
| Android Health Connect Client | 1.1.0 |
| Android minimum SDK | 28 |
| Android target SDK | 37 |

## Project Structure

```text
MediSphere/
├── AI/
│   ├── app/
│   │   ├── explainability/
│   │   ├── federated/
│   │   ├── models/
│   │   └── validation/
│   ├── data/
│   ├── saved_models/
│   ├── scripts/
│   └── requirements.txt
│
├── Backend/
│   └── src/
│
├── Frontend/
│   └── src/
│
├── MediSphereMobile/
│
├── .gitignore
└── README.md
```

## Authentication & Role-Based Access Control

MediSphere includes stateless JWT authentication for the React frontend and Spring Boot backend.

### Authentication Flow

```text
React Login / Register
        ↓
Spring Boot /api/auth
        ↓
BCrypt Password Verification
        ↓
JWT Generation
        ↓
React Stores Token
        ↓
Authorization: Bearer <JWT>
        ↓
JwtAuthenticationFilter
        ↓
Authenticated User + Role
        ↓
Protected Healthcare APIs
```

### Supported Roles

| Role | Access Model |
|---|---|
| `PATIENT` | Access patient-specific healthcare data permitted by ownership rules |
| `DOCTOR` | Access doctor functions and assigned-patient workflows |
| `ADMIN` | Administrative and system-wide operations |

The backend also applies ownership and assignment checks where required. For example, patients are restricted to their own protected records, while doctor access to patient-specific data can be restricted by doctor assignment.

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new patient account |
| POST | `/api/auth/login` | Authenticate a patient, doctor, or administrator and return a JWT |

JWT expiration is configured for 1 hour in the current backend configuration.

## FHIR Integration & Digital Twin

Milestone 1 establishes the foundation of MediSphere by integrating HL7 FHIR R4, implementing patient digital twins, and developing core healthcare management features.

### FHIR R4 Integration

- Integrates healthcare data using the HL7 FHIR R4 standard.
- Supports Patient, Practitioner, Appointment, MedicationRequest, and Observation resources.
- Provides internal FHIR REST APIs.
- Integrates with an external HAPI FHIR R4 server.
- Standardizes healthcare data for interoperability.

### Patient Digital Twin

- Creates a digital twin for each patient.
- Aggregates patient-related healthcare records.
- Maintains references to appointments, prescriptions, and vital measurements.
- Integrates patient data into the Patient 360 dashboard.
- Supports the foundation for longitudinal patient monitoring.

The digital twin maintains references to related healthcare records.

AI risk history is additionally maintained to support longitudinal risk monitoring and trend visualization.

### Healthcare Management

- Patient registration and management.
- Doctor registration and management.
- Appointment scheduling and management.
- Prescription management.
- Vital measurement management.
- Patient 360 dashboard for viewing consolidated patient information.

### Consent & Privacy Management

- Manages patient consent.
- Validates consent for wearable health data access.
- Supports privacy-aware healthcare data processing.

### Backend & Frontend Development

- Spring Boot backend development.
- React frontend development.
- MongoDB database integration.
- REST API integration between frontend and backend.

### Milestone 1 Validation

The following foundational functionality was implemented:

- FHIR R4 resource integration.
- Internal and external FHIR server connectivity.
- Patient digital twin creation.
- Patient, doctor, appointment, and prescription management.
- Patient 360 dashboard integration.
- Consent management.
- MongoDB integration.
- Frontend and backend integration.

## AI Risk Prediction & Federated Learning

Milestone 2 introduces an AI risk prediction layer for cardiovascular and diabetes risk assessment.

The AI service is implemented as a separate Python FastAPI service and is integrated with the Spring Boot backend.

### AI Service Architecture

```text
React Frontend
      ↓
Spring Boot AI REST API
      ↓
FastAPI AI Service
      ↓
Risk Prediction Models
      ↓
Prediction + Explainability
      ↓
React AI Risk Dashboard
```

### Federated Learning Architecture

The cardiovascular model is trained using federated learning across three simulated hospital clients.

```text
Hospital A
    ↓
Local Training
    ↓
    ┐
    │
Hospital B
    ↓
Local Training
    ↓
    ├────→ Federated Aggregation
    │              ↓
Hospital C        Global Model
    ↓
Local Training
```

The federated learning workflow is designed so that raw training data remains at the participating client while model information is aggregated to create the global model.

The implementation uses TensorFlow Federated (TFF).

### Cardiovascular Risk Model

**Model version:2.0.0**

#### Architecture

```text
13 Input Features
        ↓
Dense(64, ReLU)
        ↓
Dropout(0.10)
        ↓
Dense(32, ReLU)
        ↓
Dropout(0.10)
        ↓
Dense(16, ReLU)
        ↓
Dense(1, Sigmoid)
```

#### Federated Training
| Parameter | Value |
|---|---|
| Simulated hospital clients | 3 |
| Federated rounds | 10 |
| Aggregation | Weighted FedAvg |
| Client learning rate | 0.03 |
| Batch size | 32 |
A probability calibration artifact is also included for the cardiovascular model.

### Diabetes Risk Model

**Model version:4.0.0**

#### Architecture

```text
8 Input Features
       ↓
Dense(32, ReLU)
       ↓
Dropout(0.05)
       ↓
Dense(16, ReLU)
       ↓
Dense(1, Sigmoid)
```

#### Federated Training
| Parameter | Value |
|---|---|
| Simulated hospital clients | 3 |
| Federated rounds | 20 |
| Aggregation | Weighted FedAvg |
| Local epochs | 3 |
| Batch size | 32 |
| Client SGDM learning rate | 0.005 |

Training uses a train-only StandardScaler to avoid information leakage from the validation data.

### AI Explainability

MediSphere integrates SHAP-based explainability for AI risk prediction.

The explainability layer provides feature-level contributions that help show which input features influenced the model's prediction.

**Example factors**

- Age
- Blood pressure
- Cholesterol
- Maximum heart rate
- Glucose
- BMI
- Insulin
- Diabetes pedigree function

SHAP explanations are generated independently from the displayed calibrated cardiovascular probability so that calibration does not change the underlying model feature contributions.

### AI Model Validation

Milestone 2 includes an engineering validation layer covering:

- Model accuracy
- ROC-AUC
- Brier score
- Expected Calibration Error (ECE)
- Probability calibration
- Federated learning convergence
- Bias checks
- SHAP explainability
- Clinical guideline compliance

#### Validation Results

The following results were obtained during engineering validation using synthetic evaluation datasets.


| Model | Version | Accuracy | ROC-AUC | Brier Score | Federated Rounds |
|---|---|---:|---:|---:|---:|
| Cardiovascular | `2.0.0` | 92.5% | 0.9832 | 0.0524 calibrated | 10 |
| Diabetes | `4.0.0` | 94.9% | 0.9887 | 0.0548 | 20 |

#### Additional validation results

| Validation Check | Cardiovascular | Diabetes |
|---|---|---|
| Accuracy > 90% | PASS | PASS |
| Calibration | PASS | PASS |
| Bias check | PASS | PASS |
| SHAP validation | PASS | PASS |
| Federated convergence | IMPROVED | IMPROVED |
| Clinical guideline compliance | PASS | PASS |

For cardiovascular risk, calibration reduced the measured ECE from 0.1032 to 0.0194.

The validation results above are engineering results obtained using synthetic datasets and should not be interpreted as clinical performance or medical diagnostic accuracy.

### AI Risk History and Trend

MediSphere stores AI risk prediction history for selected patients.

#### Dashboard Features
- Latest cardiovascular risk
- Previous cardiovascular risk
- Latest diabetes risk
- Previous diabetes risk
- Change from previous prediction
- Increasing/decreasing/stable trend
- Model version
- Validation accuracy
- Prediction history

#### Risk History Flow

```text
Patient
   ↓
AI Prediction
   ↓
Save Risk Result
   ↓
MongoDB
   ↓
Risk History
   ↓
Latest vs Previous
   ↓
Risk Trend
```

AI risk history is stored separately from the patient's core healthcare records.

### AI Backend API

#### Endpoint Reference
The Spring Boot backend provides AI integration endpoints including:

| Function | HTTP Method | Endpoint |
|---|---|---|
| AI Health | GET | `/api/ai/health` |
| AI Model Status | GET | `/api/ai/models` |
| Cardiovascular Prediction | POST | `/api/ai/cardiovascular/predict` |
| Diabetes Prediction | POST | `/api/ai/diabetes/predict` |
| Risk History | GET | `/api/ai/risk-history/{patientId}` |
| Save Risk History | POST | `/api/ai/history` |

### AI Service Configuration

The Spring Boot service communicates with the FastAPI AI service through the configured AI base URL.

**Development configuration**
```powershell
medisphere.ai.base-url=http://localhost:8001
```

The FastAPI service runs on:
```powershell
http://localhost:8001
```

## Real-Time Monitoring & Alerts

Milestone 3 introduces real-time wearable vital monitoring, abnormal vital detection, and doctor notification capabilities.

### Supported Vital Measurements

| Vital | Threshold |
|---|---|
| Heart Rate | 50–120 BPM |
| Body Temperature | Maximum 38°C |
| Systolic Blood Pressure | 90–180 mmHg |
| Diastolic Blood Pressure | 60–120 mmHg |
| Oxygen Saturation | Minimum 92% |
| Respiratory Rate | 12–24 breaths/min |

These are configured engineering alert thresholds and are not intended to independently establish a medical diagnosis.

### Real-Time Monitoring Architecture

```text
Wearable Device
      ↓
Mi Fitness
      ↓
Android Health Connect
      ↓
MediSphere Android Application
      ↓
Wearable Vital Event
      ↓
Apache Kafka
      ↓
WearableVitalsConsumer
      ↓
WearableService
      ↓
Consent + Device + Patient Validation
      ↓
Vital Record
      ↓
MongoDB
      ↓
VitalAlertService
      ↓
Alert Generation
      ↓
DoctorNotificationProducer
      ↓
doctor-notifications Kafka Topic
      ↓
DoctorNotificationConsumer
      ↓
MongoDB
      ↓
Server-Sent Events (SSE)
      ↓
Doctor Notifications / Patient Monitoring Dashboard
```

### Kafka Topics

| Topic | Purpose |
|---|---|
| `wearable-vitals` | Receives wearable vital events |
| `doctor-notifications` | Publishes notifications generated from vital alerts |

### REST API Endpoints

#### Vital APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/vitals` | Create a vital record |
| GET | `/api/vitals` | Retrieve all vital records |
| GET | `/api/vitals/{id}` | Retrieve a vital by ID |
| GET | `/api/vitals/patient/{patientId}` | Retrieve patient-specific vitals |
| PUT | `/api/vitals/{id}` | Update a vital record |
| DELETE | `/api/vitals/{id}` | Delete a vital record |

#### Alert APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/alerts` | Retrieve alerts |
| GET | `/api/alerts/patient/{patientId}` | Retrieve patient-specific alerts |

#### Doctor Notification APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctor-notifications` | Retrieve all doctor notifications |
| GET | `/api/doctor-notifications/patient/{patientId}` | Retrieve patient notifications |

#### Server-Sent Events

```http
GET /api/notifications/stream
```

The SSE endpoint streams doctor notification events to connected frontend clients.

### Patient Monitoring Dashboard

The Patient Monitoring dashboard provides:

- Patient ID search.
- Latest vital measurement cards.
- Vital history display.
- Patient-specific alert cards.
- Real-time doctor notification updates.
- SSE connection status.
- Periodic polling for updated vitals and alerts.
- Duplicate notification prevention.

### Alert Processing Flow

```text
Incoming Vital
      ↓
Validate Device and Patient
      ↓
Validate Consent
      ↓
Store Vital Record
      ↓
Evaluate Thresholds
      ↓
Create Vital Alert
      ↓
Publish Doctor Notification
      ↓
Persist Notification
      ↓
Display Notification in Frontend
```

### Milestone 3 Validation

The following functionality is implemented in the current project:

- Wearable vital event ingestion.
- Kafka event consumption.
- Vital data persistence.
- Vital threshold evaluation.
- Alert generation.
- Doctor notification publishing.
- Doctor notification persistence.
- Patient-specific monitoring.
- Server-Sent Events integration.
- Frontend real-time notification display.

## Care Plan & Treatment

Milestone 4 introduces AI-assisted care plan generation, healthcare provider approval, intervention adherence tracking, and health outcome recording.

### Care Plan Generation

- Generates care plan drafts using the patient's latest available cardiovascular and diabetes risk history.
- Uses risk-informed, predefined guideline rules to generate care plan items.
- Stores the generation source as `AI_RISK_AND_GUIDELINE_RULES`.
- Creates generated plans with `PENDING_REVIEW` status.

The current guideline mapping is a prototype and is not a comprehensive clinical guideline engine.

### Provider Review and Approval

- Generated care plans are presented as drafts for healthcare provider review.
- A doctor can approve a care plan.
- The approving doctor's ID is stored with the approval information.
- AI-generated plans are decision-support drafts and do not independently prescribe treatment.

### Intervention Adherence Tracking

Each care plan intervention supports the following statuses:

| Status | Description |
|---|---|
| `NOT_STARTED` | The intervention has not been started. |
| `IN_PROGRESS` | The intervention is currently in progress. |
| `COMPLETED` | The intervention has been marked completed. |
| `SKIPPED` | The intervention has been skipped. |

Intervention notes and update timestamps are also supported.
The dashboard displays the proportion of completed interventions.

### Health Outcome Tracking

- Records health outcome measurements against a care plan.
- Stores the metric name, numeric value, unit, notes, and timestamp.
- Displays the latest and previous measurements for the same metric and unit.
- Calculates and displays the numerical difference between those measurements.

Outcome comparisons are numerical only and do not determine whether a patient's health has clinically improved or worsened.

### Care Plan Workflow

```text
Select Patient
      ↓
Retrieve Latest Risk History
      ↓
Generate Care Plan Draft
      ↓
Pending Provider Review
      ↓
Provider Approval
      ↓
Track Intervention Adherence
      ↓
Record Health Outcomes
      ↓
Compare Measurements Over Time
```
### Care Plan Dashboard

The React dashboard supports:

- Patient selection
- Care plan generation
- Patient risk context display
- Intervention status updates and notes
- Health outcome entry and history
- Latest-versus-previous outcome comparison
- Care plan approval by a doctor

### Care Plan API

The backend exposes care plan operations through the `/api/care-plans` API.

The frontend service uses this API for retrieving and generating plans, updating intervention adherence, recording outcomes, and approving plans.

### Milestone 4 Validation

The following implementation checks were completed:

- Care Plans page integrated into the React application.
- Care plan generation and dashboard UI implemented.
- Intervention adherence controls implemented.
- Health outcome entry and comparison UI implemented.
- Provider approval UI implemented.
- Frontend production build completed successfully.

Backend integration and persistence should be tested in the target environment before treating those behaviors as end-to-end verified.

## Setup and Installation

### Prerequisites
- Java 20 (project compiler target)
- MongoDB
- Apache Kafka
- Node.js and npm
- Python 3.x (compatible with the AI requirements)
- Android Studio for the mobile application

### MongoDB

The backend uses:
```powershell
mongodb://localhost:27017/test
```

Make sure MongoDB is running.

### Apache Kafka

The backend is configured for:
```powershell
localhost:9092
```

The wearable event topic is:
```powershell
wearable-vitals
```

### Backend Environment Variables

The backend expects the JWT signing secret to be supplied through an environment variable:

```powershell
$env:JWT_SECRET = "<base64-encoded-secret>"
```

Do not commit JWT secrets, passwords, API keys, or other credentials to Git.

The backend development configuration uses:
- MongoDB: `mongodb://localhost:27017/test`
- Spring Boot: `http://localhost:8080`
- Kafka: `localhost:9092`
- FastAPI AI service: `http://localhost:8001`
- External FHIR server: `https://hapi.fhir.org/baseR4`

### Backend Setup

Navigate to the Backend directory:
```powershell
cd Backend
```

Start the Spring Boot backend:
```powershell
.\mvnw.cmd spring-boot:run
```

Backend:
```powershell
http://localhost:8080
```

### AI Service Setup

Navigate to the AI directory:
```powershell
cd AI
```

Install the Python dependencies:
```powershell
pip install -r requirements.txt
```

Start the FastAPI service:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

AI service:
```powershell
http://localhost:8001
```

Health endpoint:
```powershell
http://localhost:8001/health
```

The trained model artifacts are stored in:
```powershell
AI/saved_models/
```

These include the cardiovascular and diabetes federated model weights, metadata, scalers, and cardiovascular calibration artifact.

### Frontend Setup

Navigate to the Frontend directory:
```powershell
cd Frontend
```

Install dependencies:
```powershell
npm install
```

Start the development server:
```powershell
npm run dev
```

Frontend:
```powershell
http://localhost:5173
```

### Android Application

Open `MediSphereMobile/` in Android Studio.

The application uses:
- Kotlin
- Jetpack Compose
- Android Health Connect
- Health Connect Client 1.1.0
- Minimum SDK 28
- Target SDK 37

The current mobile implementation requests Health Connect read access for:
- Heart rate
- Oxygen saturation

The current backend submission flow sends the latest real heart-rate reading together with the MediSphere patient ID and wearable device ID. Unsupported or unavailable measurements remain `null` rather than being fabricated.

For a physical Android device, ADB reverse port forwarding can expose the local backend:
```powershell
adb.exe -s <DEVICE_SERIAL> reverse tcp:8080 tcp:8080
```

## Security and Privacy

- Do not commit passwords, API keys, tokens, or other secrets.
- Do not place real patient-identifying information in the repository.
- The public external FHIR server is for testing/demo purposes and should not be used for production PHI.
- Generated build files, IDE files, Python caches, backup files, local configuration, and other development artifacts are excluded through `.gitignore`.
- The AI datasets used for Milestone 2 validation are synthetic or publicly available development datasets and are not intended to represent real patient records.
- AI predictions are intended for educational and engineering demonstration purposes and are not a substitute for professional medical diagnosis or clinical decision-making.

## Milestone Status

### Milestone 1 — FHIR Integration & Digital Twin
- FHIR R4 integration
- Healthcare data standardization
- Patient Digital Twin foundation
- Patient management
- Doctor management
- Appointment management
- Prescription management
- Patient 360 view
- Consent management
- Privacy and access control
- JWT authentication and role-based access control
- Wearable device integration foundation
- Kafka infrastructure setup
- Healthcare event processing foundation
- Spring Boot backend development
- React frontend development
- MongoDB database integration
 
### Milestone 2 — AI Risk Prediction
- AI Risk Prediction
- Cardiovascular risk prediction model
- Diabetes risk prediction model
- Federated learning implementation
- Multi-hospital simulated federated training
- Cardiovascular model v2.0.0
- Diabetes model v4.0.0
- Model metadata and versioning
- Model scalers and saved model artifacts
- Cardiovascular probability calibration
- SHAP explainability
- AI model validation
- Accuracy validation above 90%
- ROC-AUC evaluation
- Brier score evaluation
- ECE calibration evaluation
- Federated convergence validation
- Bias validation
- Clinical guideline compliance validation
- Spring Boot to FastAPI AI integration
- AI model status endpoint
- AI risk prediction APIs
- AI risk history persistence
- Latest vs previous risk comparison
- AI risk trend visualization
- Frontend AI Risk Prediction dashboard

### Milestone 3 — Real-Time Monitoring & Alerts
- Real-time wearable vital monitoring
- Wearable vital data ingestion
- Apache Kafka wearable event pipeline
- Wearable data validation
- Patient validation
- Device registration validation
- Device connection validation
- Device assignment validation
- Consent validation
- Heart rate monitoring
- Blood pressure monitoring
- Temperature monitoring
- SpO2 monitoring
- Respiratory rate monitoring
- Threshold-based health alert detection
- MongoDB vital data persistence
- Health alert generation
- Doctor notification processing
- Kafka doctor notification pipeline
- Server-Sent Events (SSE) integration
- Real-time notification delivery
- Patient monitoring dashboard
- Doctor notification dashboard
- Spring Boot wearable APIs
- Wearable vital APIs
- Health alert APIs
- Doctor notification APIs
- React real-time monitoring frontend
- End-to-end wearable monitoring workflow

### Milestone 4 — Care Plan & Treatment
- Risk-informed care plan draft generation
- Cardiovascular and diabetes risk context
- Predefined guideline-rule mapping
- Pending provider review status
- Doctor approval and approver tracking
- Intervention adherence status updates
- Intervention notes and timestamps
- Health outcome measurement recording
- Outcome history and numerical comparison
- Care Plans & Treatment React dashboard
- Spring Boot care plan API
- Frontend production build

## 🚀 Current Development Status

| Milestone | Description | Status |
|---|---|---|
| Milestone 1 | Project Foundation & Patient Management | ✅ Completed |
| Milestone 2 | AI Health Prediction & Digital Twin | ✅ Completed |
| Milestone 3 | Real-Time Monitoring & Alerts | ✅ Completed |
| Milestone 4 | Future Healthcare Enhancements |✅ Completed |

## Future Enhancements

- Multi-factor authentication and refresh-token support
- Advanced wearable integrations and support for additional vital measurements
- Enhanced patient analytics and health outcome reporting
- Improved alert prioritization, alert-fatigue prevention, and notification management
- Support for additional FHIR R4 resources
- Production-grade security, privacy, and cloud deployment
- Automated testing and CI/CD pipelines
- Enhanced AI models, clinical decision support, and guideline integration
- Advanced federated learning and continuous model monitoring
- Personalized care plans, progress tracking, and automated reminders

## Author

**MediSphere Healthcare Management System** 

Developed as part of an Infosys Springboard Internship Project.

## License

This project is developed for educational and internship-project purposes.
