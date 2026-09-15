# MediSphere Healthcare Management System

MediSphere is a full-stack healthcare management system developed as an
Infosys Springboard internship project.

The system integrates patient management, HL7 FHIR R4, MongoDB patient
digital twins, Patient 360, consent management, wearable health data,
Apache Kafka, an Android application using Health Connect, and AI-powered
health risk prediction using federated learning.

## Project Objectives

1. Connect healthcare systems using FHIR.
2. Store patient digital twins in MongoDB.
3. Connect wearable devices and ingest health data.
4. Create a Patient 360 dashboard.
5. Manage patient consent.
6. Provide AI-based cardiovascular and diabetes risk prediction.
7. Apply federated learning so participating hospitals can train models
   without sharing raw patient training data.
8. Provide explainable AI using SHAP and validated risk outputs.

## Key Features

- **Patient Management** --- Create, view, update, and delete patient
  records.

- **Doctor Management** --- Manage doctor details and specializations.

- **Appointment Management** --- Manage patient-doctor appointments
  and FHIR Appointment resources.

- **Prescription Management** --- Manage prescriptions and FHIR
  MedicationRequest resources.

- **Vital Monitoring** --- Store heart rate, temperature, blood
  pressure, oxygen saturation, respiratory rate, source, and device
  information.

- **FHIR R4 Integration** --- Support Patient, Practitioner,
  Appointment, MedicationRequest, and Observation resources.

- **External FHIR Integration** --- Create and retrieve resources from
  an external FHIR R4 server.

- **Patient Digital Twin** --- Maintain an aggregated representation
  of patient-related healthcare records.

- **Patient 360 Dashboard** --- Display patient profile, digital twin
  status, vitals, appointments, prescriptions, and doctors.

- **Consent Management** --- Manage patient consent and require active
  `WEARABLE_DATA` consent for wearable ingestion.

- **Wearable Integration** --- Receive health data through Android
  Health Connect.

- **Kafka Pipeline** --- Process wearable vital events through the
  `wearable-vitals` Kafka topic.

- **AI Risk Prediction** --- Predict cardiovascular and diabetes risk
  using federated machine learning models.

- **Federated Learning** --- Train participating hospital models locally
  and aggregate model updates without centralizing raw training data.

- **SHAP Explainability** --- Provide feature-level explanations for
  cardiovascular and diabetes risk predictions.

- **Risk Calibration** --- Apply probability calibration to the
  cardiovascular risk model for improved reliability of predicted risk
  probabilities.

- **AI Risk History** --- Store previous AI risk predictions for a
  patient and display changes between predictions.

- **AI Risk Trend** --- Display latest risk, previous risk, percentage
  change, trend direction, model version, and validation accuracy.

- **Clinical Guideline Validation** --- Validate AI outputs against
  defined clinical guideline checks.

## System Architecture

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

##FHIR Integration Flow
Spring Boot Backend
    ↓
FHIR R4
    ↓
External FHIR Server


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

Wearable Data Flow
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

The backend validates that the wearable is connected, assigned to the
patient, the patient exists, and the required WEARABLE_DATA consent is
active.

The current real-device integration was tested with a Redmi Watch 5 Lite
through Mi Fitness and Health Connect. Only values actually available
from the data source are stored; unsupported measurements are not
fabricated.

FHIR Integration
Internal FHIR Endpoints
Resource	Endpoint
Patient	GET /api/fhir/Patient/{id}
Practitioner	GET /api/fhir/Practitioner/{id}
Appointment	GET /api/fhir/Appointment/{id}
MedicationRequest	GET /api/fhir/MedicationRequest/{id}
Vital Observation	GET /api/fhir/Observation/vital/{id}

The configured development external FHIR server is:

https://hapi.fhir.org/baseR4

The public HAPI FHIR test server is intended for testing and
demonstration, not production storage of patient or confidential
information.

Vital FHIR Codes
Vital	LOINC
Heart rate	8867-4
Body temperature	8310-5
Blood pressure panel	85354-9
Systolic blood pressure	8480-6
Diastolic blood pressure	8462-4
Oxygen saturation	2708-6
Respiratory rate	9279-1
AI Risk Prediction & Federated Learning

Milestone 2 introduces an AI risk prediction layer for cardiovascular
and diabetes risk assessment.

The AI service is implemented as a separate Python FastAPI service and
is integrated with the Spring Boot backend.

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
Federated Learning Architecture

The cardiovascular model is trained using federated learning across
three simulated hospital clients.

Hospital A ── Local Training ──┐
                               │
Hospital B ── Local Training ──┼──→ Federated Aggregation
                               │
Hospital C ── Local Training ──┘
                                      ↓
                              Global Model

The federated learning workflow is designed so that raw training data
remains at the participating client while model information is
aggregated to create the global model.

The implementation uses TensorFlow Federated (TFF).

Cardiovascular Risk Model

Model version:

2.0.0

Architecture:

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

Federated training:

3 simulated hospital clients
10 federated rounds
Weighted FedAvg
Client learning rate: 0.03
Batch size: 32

A probability calibration artifact is also included for the
cardiovascular model.

Diabetes Risk Model

Model version:

4.0.0

Architecture:

8 Input Features
      ↓
Dense(32, ReLU)
      ↓
Dropout(0.05)
      ↓
Dense(16, ReLU)
      ↓
Dense(1, Sigmoid)

Federated training:

3 simulated hospital clients
20 federated rounds
Weighted FedAvg
3 local epochs
Batch size: 32
Client SGDM learning rate: 0.005

Training uses a train-only StandardScaler to avoid information leakage
from the validation data.

AI Explainability

MediSphere integrates SHAP-based explainability for AI risk prediction.

The explainability layer provides feature-level contributions that help
show which input features influenced the model's prediction.

Example factors can include:

Age
Blood pressure
Cholesterol
Maximum heart rate
Glucose
BMI
Insulin
Diabetes pedigree function

SHAP explanations are generated independently from the displayed
calibrated cardiovascular probability so that calibration does not
change the underlying model feature contributions.

AI Model Validation

Milestone 2 includes an engineering validation layer covering:

Model accuracy
ROC-AUC
Brier score
Expected Calibration Error (ECE)
Probability calibration
Federated learning convergence
Bias checks
SHAP explainability
Clinical guideline compliance
Validation Results

The following results were obtained during engineering validation using
synthetic evaluation datasets.

Model	Version	Accuracy	ROC-AUC	Brier Score	Federated Rounds
Cardiovascular	2.0.0	92.5%	0.9832	0.0524 calibrated	10
Diabetes	4.0.0	94.9%	0.9887	0.0548	20

Additional validation results:

Validation Check	Cardiovascular	Diabetes
Accuracy > 90%	PASS	PASS
Calibration	PASS	PASS
Bias check	PASS	PASS
SHAP validation	PASS	PASS
Federated convergence	IMPROVED	IMPROVED
Clinical guideline compliance	PASS	PASS

For cardiovascular risk, calibration reduced the measured ECE from
0.1032 to 0.0194.

The validation results above are engineering results obtained using
synthetic datasets and should not be interpreted as clinical
performance or medical diagnostic accuracy.

AI Risk History and Trend

MediSphere stores AI risk prediction history for selected patients.

The AI dashboard provides:

Latest cardiovascular risk
Previous cardiovascular risk
Latest diabetes risk
Previous diabetes risk
Change from previous prediction
Increasing/decreasing/stable trend
Model version
Validation accuracy
Prediction history

Example:

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

AI risk history is stored separately from the patient's core healthcare
records.

AI Backend Endpoints

The Spring Boot backend provides AI integration endpoints including:

Function	Endpoint
AI Health	GET /api/ai/health
AI Model Status	GET /api/ai/models
Cardiovascular Prediction	POST /api/ai/cardiovascular/predict
Diabetes Prediction	POST /api/ai/diabetes/predict
Risk History	GET /api/ai/risk-history/{patientId}
Save Risk History	POST /api/ai/history

The Spring Boot service communicates with the FastAPI AI service through
the configured AI base URL.

Development configuration:

medisphere.ai.base-url=http://localhost:8001

The FastAPI service runs on:

http://localhost:8001
Technology Stack
Layer	Technology
Frontend	React, Vite
Backend	Spring Boot, Java
AI Service	Python, FastAPI
AI/ML	TensorFlow, TensorFlow Federated
Explainability	SHAP
Database	MongoDB
Messaging	Apache Kafka
Healthcare Interoperability	HL7 FHIR R4
FHIR Library	HAPI FHIR
Mobile	Android, Kotlin, Jetpack Compose
Health Data	Android Health Connect
Backend Build	Maven
Mobile Build	Gradle
Project Structure
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
Backend Setup
Prerequisites
Java 25
MongoDB
Apache Kafka
Node.js and npm
Python 3.x
Android Studio for the mobile application
MongoDB

The backend uses:

mongodb://localhost:27017/medisphere_db

Make sure MongoDB is running.

Kafka

The backend is configured for:

localhost:9092

The wearable event topic is:

wearable-vitals
Start Backend
cd Backend
.\mvnw.cmd spring-boot:run

Backend:

http://localhost:8080
AI Service Setup

Navigate to the AI directory:

cd AI

Install the Python dependencies:

pip install -r requirements.txt

Start the FastAPI service:

uvicorn app.main:app --host 0.0.0.0 --port 8001

AI service:

http://localhost:8001

Health endpoint:

http://localhost:8001/health

The trained model artifacts are stored in:

AI/saved_models/

These include the cardiovascular and diabetes federated model weights,
metadata, scalers, and cardiovascular calibration artifact.

Frontend Setup
cd Frontend
npm install
npm run dev

Frontend:

http://localhost:5173
Android Application

Open MediSphereMobile/ in Android Studio.

The application uses Kotlin, Jetpack Compose, and Health Connect, with
minimum SDK 28.

For a physical Android device, ADB reverse port forwarding can expose
the local backend:

adb.exe -s <DEVICE_SERIAL> reverse tcp:8080 tcp:8080
Patient Digital Twin
Patient

  ├── Appointments
  ├── Prescriptions
  ├── Vitals
  └── AI Risk History

          ↓

   Patient Digital Twin

          ↓

      Patient 360

The digital twin maintains references to related healthcare records.

AI risk history is additionally maintained to support longitudinal
risk monitoring and trend visualization.

Important Security Notes
Do not commit passwords, API keys, tokens, or other secrets.
Do not place real patient-identifying information in the repository.
The public external FHIR server is for testing/demo purposes and
should not be used for production PHI.
Generated build files, IDE files, Python caches, backup files, local
configuration, and other development artifacts are excluded through
.gitignore.
The AI datasets used for Milestone 2 validation are synthetic or
publicly available development datasets and are not intended to
represent real patient records.
AI predictions are intended for educational and engineering
demonstration purposes and are not a substitute for professional
medical diagnosis or clinical decision-making.
Milestone 1 Status
 FHIR integration
 External FHIR server communication
 MongoDB patient digital twins
 Wearable device management
 Health Connect integration
 Kafka wearable event pipeline
 Patient 360 dashboard
 Patient consent management
 Patient management
 Doctor management
 Appointment management
 Prescription management
 Vital management
 Android mobile application
Milestone 2 Status
AI Risk Prediction
 Cardiovascular risk prediction model
 Diabetes risk prediction model
 Federated learning implementation
 Multi-hospital simulated federated training
 Cardiovascular model v2.0.0
 Diabetes model v4.0.0
 Model metadata and versioning
 Model scalers and saved model artifacts
 Cardiovascular probability calibration
 SHAP explainability
 AI model validation
 Accuracy validation above 90%
 ROC-AUC evaluation
 Brier score evaluation
 ECE calibration evaluation
 Federated convergence validation
 Bias validation
 Clinical guideline compliance validation
 Spring Boot to FastAPI AI integration
 AI model status endpoint
 AI risk prediction APIs
 AI risk history persistence
 Latest vs previous risk comparison
 AI risk trend visualization
 Frontend AI Risk Prediction dashboard
Future Enhancements
Role-based authentication and authorization
Additional wearable data types
Advanced patient analytics
Healthcare alerts and notifications
Additional FHIR resource types
Production-grade security and privacy controls
Cloud deployment
Automated testing and CI/CD
Enhanced clinical decision-support capabilities
Further AI model improvements using larger validated datasets
Additional federated healthcare clients
Continuous model monitoring and drift detection
Author

MediSphere Healthcare Management System

Developed as part of an Infosys Springboard Internship Project.

License

This project is developed for educational and internship-project
purposes.
