import { useState } from "react";
import "./Fhir.css";
import Header from "../../components/Header";

import {
  getFhirPatient,
  getFhirPractitioner,
  getFhirAppointment,
  getFhirMedicationRequest,
} from "../../services/fhirService";

function FhirPage() {
  const [activeTab, setActiveTab] = useState("Patient");

  const [resourceId, setResourceId] = useState("");

  const [responseData, setResponseData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const getResourceDetails = () => {
    switch (activeTab) {
      case "Patient":
        return {
          title: "FHIR Patient Resource",
          description:
            "Retrieve a patient from the MediSphere backend in FHIR format.",
          placeholder: "Enter Patient ID",
          buttonText: "Get FHIR Patient",
        };

      case "Practitioner":
        return {
          title: "FHIR Practitioner Resource",
          description:
            "Retrieve a doctor as an HL7 FHIR Practitioner resource.",
          placeholder: "Enter Doctor ID",
          buttonText: "Get FHIR Practitioner",
        };

      case "Appointment":
        return {
          title: "FHIR Appointment Resource",
          description:
            "Retrieve an appointment from the MediSphere backend in FHIR format.",
          placeholder: "Enter Appointment ID",
          buttonText: "Get FHIR Appointment",
        };

      case "Medication Request":
        return {
          title: "FHIR Medication Request Resource",
          description:
            "Retrieve a prescription as an HL7 FHIR MedicationRequest resource.",
          placeholder: "Enter Prescription ID",
          buttonText: "Get FHIR Medication Request",
        };

      default:
        return {};
    }
  };

  const resourceDetails = getResourceDetails();

  const handleFetch = async () => {
    if (!resourceId.trim()) {
      setError("Please enter a resource ID.");
      setResponseData(null);
      return;
    }

    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      let data;

      switch (activeTab) {
        case "Patient":
          data = await getFhirPatient(resourceId);
          break;

        case "Practitioner":
          data = await getFhirPractitioner(resourceId);
          break;

        case "Appointment":
          data = await getFhirAppointment(resourceId);
          break;

        case "Medication Request":
          data = await getFhirMedicationRequest(resourceId);
          break;

        default:
          throw new Error("Invalid FHIR resource selected.");
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message || "Failed to retrieve FHIR resource.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResourceId("");
    setResponseData(null);
    setError("");
  };

  return (
    <>
      <Header
        title="FHIR Integration"
        description="View MediSphere healthcare data using HL7 FHIR resources"
      />

      <div className="fhir-tabs">
        <button
          className={activeTab === "Patient" ? "active-tab" : ""}
          onClick={() => handleTabChange("Patient")}
        >
          Patient
        </button>

        <button
          className={activeTab === "Practitioner" ? "active-tab" : ""}
          onClick={() => handleTabChange("Practitioner")}
        >
          Practitioner
        </button>

        <button
          className={activeTab === "Appointment" ? "active-tab" : ""}
          onClick={() => handleTabChange("Appointment")}
        >
          Appointment
        </button>

        <button
          className={
            activeTab === "Medication Request" ? "active-tab" : ""
          }
          onClick={() => handleTabChange("Medication Request")}
        >
          Medication Request
        </button>
      </div>

      <div className="fhir-card">
        <h2>{resourceDetails.title}</h2>

        <p>{resourceDetails.description}</p>

        <div className="fhir-input-section">
          <input
            type="text"
            placeholder={resourceDetails.placeholder}
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
          />

          <button onClick={handleFetch} disabled={loading}>
            {loading ? "Loading..." : resourceDetails.buttonText}
          </button>
        </div>

        {error && (
          <div className="fhir-error">
            {error}
          </div>
        )}

        {responseData && (
          <div className="fhir-response-section">
            <h3>FHIR Response</h3>

            <pre>
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}

export default FhirPage;