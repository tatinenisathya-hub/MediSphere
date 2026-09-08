const API_URL =
  "http://localhost:8080/api/fhir";

const EXTERNAL_FHIR_API_URL =
  "http://localhost:8080/api/fhir/external";


// ===============================
// FHIR PATIENT
// ===============================

export const getFhirPatient =
  async (id) => {

    const response =
      await fetch(
        `${API_URL}/Patient/${encodeURIComponent(id)}`,
        {
          headers: {
            Accept:
              "application/fhir+json",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch FHIR Patient"
      );
    }

    return response.json();
  };


// ===============================
// FHIR PRACTITIONER
// ===============================

export const getFhirPractitioner =
  async (id) => {

    const response =
      await fetch(
        `${API_URL}/Practitioner/${encodeURIComponent(id)}`,
        {
          headers: {
            Accept:
              "application/fhir+json",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch FHIR Practitioner"
      );
    }

    return response.json();
  };


// ===============================
// FHIR APPOINTMENT
// ===============================

export const getFhirAppointment =
  async (id) => {

    const response =
      await fetch(
        `${API_URL}/Appointment/${encodeURIComponent(id)}`,
        {
          headers: {
            Accept:
              "application/fhir+json",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch FHIR Appointment"
      );
    }

    return response.json();
  };


// ===============================
// FHIR MEDICATION REQUEST
// ===============================

export const getFhirMedicationRequest =
  async (id) => {

    const response =
      await fetch(
        `${API_URL}/MedicationRequest/${encodeURIComponent(id)}`,
        {
          headers: {
            Accept:
              "application/fhir+json",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch FHIR Medication Request"
      );
    }

    return response.json();
  };


// ===============================
// FHIR OBSERVATION / VITALS
// ===============================

export const getFhirObservation =
  async (id) => {

    const response =
      await fetch(
        `${API_URL}/Observation/vital/${encodeURIComponent(id)}`,
        {
          headers: {
            Accept:
              "application/fhir+json",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch FHIR Observation"
      );
    }

    return response.json();
  };


// =====================================================
// EXTERNAL FHIR SERVER - CREATE RESOURCE
// =====================================================

export const createExternalFhirResource =
  async (
    resourceType,
    resource
  ) => {

    const response =
      await fetch(
        `${EXTERNAL_FHIR_API_URL}/${resourceType}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/fhir+json",

            Accept:
              "application/fhir+json",
          },

          body:
            JSON.stringify(resource),
        }
      );

    const responseText =
      await response.text();

    let responseData;

    try {
      responseData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      responseData =
        responseText;
    }

    if (!response.ok) {

      const message =
        typeof responseData === "string"
          ? responseData
          : responseData?.issue?.[0]?.diagnostics ||
            `External FHIR server returned HTTP ${response.status}`;

      throw new Error(message);
    }

    return responseData;
  };


// =====================================================
// EXTERNAL FHIR SERVER - READ RESOURCE
// =====================================================

export const getExternalFhirResource =
  async (
    resourceType,
    resourceId
  ) => {

    const response =
      await fetch(
        `${EXTERNAL_FHIR_API_URL}/${resourceType}/${encodeURIComponent(
          resourceId
        )}`,
        {
          headers: {
            Accept:
              "application/fhir+json",
          },
        }
      );

    const responseText =
      await response.text();

    let responseData;

    try {
      responseData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      responseData =
        responseText;
    }

    if (!response.ok) {

      const message =
        typeof responseData === "string"
          ? responseData
          : responseData?.issue?.[0]?.diagnostics ||
            `External FHIR server returned HTTP ${response.status}`;

      throw new Error(message);
    }

    return responseData;
  };