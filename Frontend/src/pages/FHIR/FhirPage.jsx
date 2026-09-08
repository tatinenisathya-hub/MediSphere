import { useState } from "react";
import "./Fhir.css";
import Header from "../../components/Header";

import {
  getFhirPatient,
  getFhirPractitioner,
  getFhirAppointment,
  getFhirMedicationRequest,
  createExternalFhirResource,
  getExternalFhirResource,
} from "../../services/fhirService";

function FhirPage() {
  // =========================================
  // LOCAL FHIR STATE
  // =========================================

  const [activeTab, setActiveTab] = useState("Patient");

  const [resourceId, setResourceId] = useState("");

  const [responseData, setResponseData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================
  // EXTERNAL FHIR STATE
  // =========================================

  const [externalResponse, setExternalResponse] = useState(null);

  const [externalResourceId, setExternalResourceId] =
    useState("");

  const [externalLoading, setExternalLoading] =
    useState(false);

  const [externalError, setExternalError] =
    useState("");

  const [externalSuccess, setExternalSuccess] =
    useState("");


  // =========================================
  // GET RESOURCE DETAILS
  // =========================================

  const getResourceDetails = () => {
    switch (activeTab) {
      case "Patient":
        return {
          title: "FHIR Patient Resource",
          description:
            "Retrieve a patient from the MediSphere backend in FHIR format.",
          placeholder: "Enter Patient ID",
          buttonText: "Get FHIR Patient",
          resourceType: "Patient",
        };

      case "Practitioner":
        return {
          title: "FHIR Practitioner Resource",
          description:
            "Retrieve a doctor as an HL7 FHIR Practitioner resource.",
          placeholder: "Enter Doctor ID",
          buttonText: "Get FHIR Practitioner",
          resourceType: "Practitioner",
        };

      case "Appointment":
        return {
          title: "FHIR Appointment Resource",
          description:
            "Retrieve an appointment from the MediSphere backend in FHIR format.",
          placeholder: "Enter Appointment ID",
          buttonText: "Get FHIR Appointment",
          resourceType: "Appointment",
        };

      case "Medication Request":
        return {
          title: "FHIR Medication Request Resource",
          description:
            "Retrieve a prescription as an HL7 FHIR MedicationRequest resource.",
          placeholder: "Enter Prescription ID",
          buttonText: "Get FHIR Medication Request",
          resourceType: "MedicationRequest",
        };

      default:
        return {};
    }
  };


  const resourceDetails = getResourceDetails();


  // =========================================
  // GET FHIR RESOURCE FROM MEDISPHERE
  // =========================================

  const handleFetch = async () => {
    if (!resourceId.trim()) {
      setError("Please enter a resource ID.");
      setResponseData(null);
      return;
    }

    setLoading(true);
    setError("");
    setResponseData(null);

    setExternalResponse(null);
    setExternalResourceId("");
    setExternalError("");
    setExternalSuccess("");

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
          data =
            await getFhirMedicationRequest(resourceId);
          break;

        default:
          throw new Error(
            "Invalid FHIR resource selected."
          );
      }

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to retrieve FHIR resource."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // SEND FHIR RESOURCE TO EXTERNAL SERVER
  // =========================================

  const handleSendToExternal = async () => {
    if (!responseData) {
      setExternalError(
        "Retrieve the MediSphere FHIR resource first."
      );
      return;
    }

    setExternalLoading(true);
    setExternalError("");
    setExternalSuccess("");
    setExternalResponse(null);
    setExternalResourceId("");

    try {
      const resourceType =
        resourceDetails.resourceType;

      const data =
        await createExternalFhirResource(
          resourceType,
          responseData
        );

      setExternalResponse(data);

      if (data?.id) {
        setExternalResourceId(data.id);

        setExternalSuccess(
          `${resourceType} successfully created on the external FHIR server.`
        );
      } else {
        setExternalSuccess(
          "FHIR resource was sent successfully to the external FHIR server."
        );
      }
    } catch (err) {
      console.error(err);

      setExternalError(
        err.message ||
          "Failed to send resource to external FHIR server."
      );
    } finally {
      setExternalLoading(false);
    }
  };


  // =========================================
  // READ RESOURCE FROM EXTERNAL SERVER
  // =========================================

  const handleReadFromExternal = async () => {
    if (!externalResourceId.trim()) {
      setExternalError(
        "Please enter the external FHIR resource ID."
      );
      return;
    }

    setExternalLoading(true);
    setExternalError("");
    setExternalSuccess("");
    setExternalResponse(null);

    try {
      const data =
        await getExternalFhirResource(
          resourceDetails.resourceType,
          externalResourceId.trim()
        );

      setExternalResponse(data);

      setExternalSuccess(
        `${resourceDetails.resourceType} was successfully retrieved from the external FHIR server.`
      );
    } catch (err) {
      console.error(err);

      setExternalError(
        err.message ||
          "Failed to retrieve the external FHIR resource."
      );
    } finally {
      setExternalLoading(false);
    }
  };


  // =========================================
  // CHANGE FHIR TAB
  // =========================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setResourceId("");

    setResponseData(null);

    setError("");

    setExternalResponse(null);

    setExternalResourceId("");

    setExternalError("");

    setExternalSuccess("");
  };


  // =========================================
  // PAGE
  // =========================================

  return (
    <>
      <Header
        title="FHIR Integration"
        description="View MediSphere healthcare data using HL7 FHIR resources"
      />


      {/* =========================================
          FHIR RESOURCE TABS
          ========================================= */}

      <div className="fhir-tabs">

        <button
          className={
            activeTab === "Patient"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            handleTabChange("Patient")
          }
        >
          Patient
        </button>


        <button
          className={
            activeTab === "Practitioner"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            handleTabChange("Practitioner")
          }
        >
          Practitioner
        </button>


        <button
          className={
            activeTab === "Appointment"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            handleTabChange("Appointment")
          }
        >
          Appointment
        </button>


        <button
          className={
            activeTab === "Medication Request"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            handleTabChange(
              "Medication Request"
            )
          }
        >
          Medication Request
        </button>

      </div>


      {/* =========================================
          MEDISPHERE FHIR RESOURCE
          ========================================= */}

      <div className="fhir-card">

        <h2>
          {resourceDetails.title}
        </h2>

        <p>
          {resourceDetails.description}
        </p>


        <div className="fhir-input-section">

          <input
            type="text"
            placeholder={
              resourceDetails.placeholder
            }
            value={resourceId}
            onChange={(e) =>
              setResourceId(e.target.value)
            }
          />

          <button
            onClick={handleFetch}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : resourceDetails.buttonText}
          </button>

        </div>


        {/* LOCAL FHIR ERROR */}

        {error && (
          <div className="fhir-error">
            {error}
          </div>
        )}


        {/* LOCAL FHIR RESPONSE */}

        {responseData && (
          <div className="fhir-response-section">

            <h3>
              MediSphere FHIR Response
            </h3>

            <pre>
              {JSON.stringify(
                responseData,
                null,
                2
              )}
            </pre>


            {/* =====================================
                EXTERNAL FHIR SERVER
                ===================================== */}

            <div
              style={{
                marginTop: "25px",
                paddingTop: "25px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >

              <h3>
                External FHIR Server
              </h3>

              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "15px",
                }}
              >
                Send this MediSphere FHIR
                resource to the external
                HAPI FHIR R4 server.
              </p>


              {/* SEND BUTTON */}

              <button
                onClick={
                  handleSendToExternal
                }
                disabled={externalLoading}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#2563eb",
                  color: "#ffffff",
                  cursor:
                    externalLoading
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "600",
                }}
              >
                {externalLoading
                  ? "Sending..."
                  : "Send to External FHIR Server"}
              </button>


              {/* SUCCESS MESSAGE */}

              {externalSuccess && (
                <div
                  style={{
                    background: "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color: "#047857",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "15px",
                  }}
                >
                  {externalSuccess}
                </div>
              )}


              {/* ERROR MESSAGE */}

              {externalError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color: "#b91c1c",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "15px",
                  }}
                >
                  {externalError}
                </div>
              )}


              {/* =================================
                  EXTERNAL RESOURCE ID
                  ================================= */}

              {externalResourceId && (
                <div
                  style={{
                    marginTop: "20px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    External FHIR Resource ID
                  </label>


                  <input
                    type="text"
                    value={
                      externalResourceId
                    }
                    onChange={(e) =>
                      setExternalResourceId(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      padding: "10px",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "6px",
                      boxSizing: "border-box",
                    }}
                  />


                  <br />


                  <button
                    onClick={
                      handleReadFromExternal
                    }
                    disabled={externalLoading}
                    style={{
                      marginTop: "10px",
                      padding:
                        "10px 18px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#7c3aed",
                      color: "#ffffff",
                      cursor:
                        externalLoading
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {externalLoading
                      ? "Reading..."
                      : "Read from External FHIR Server"}
                  </button>

                </div>
              )}


              {/* =================================
                  EXTERNAL FHIR RESPONSE
                  ================================= */}

              {externalResponse && (
                <div
                  style={{
                    marginTop: "25px",
                  }}
                >

                  <h3>
                    External FHIR Response
                  </h3>

                  <pre>
                    {JSON.stringify(
                      externalResponse,
                      null,
                      2
                    )}
                  </pre>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </>
  );
}

export default FhirPage;