const API_URL = "http://localhost:8080/api/fhir";

// ===============================
// FHIR PATIENT
// ===============================
export const getFhirPatient = async (id) => {
  const response = await fetch(`${API_URL}/Patient/${id}`, {
    headers: {
      Accept: "application/fhir+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch FHIR Patient");
  }

  return response.json();
};


// ===============================
// FHIR PRACTITIONER
// ===============================
export const getFhirPractitioner = async (id) => {
  const response = await fetch(`${API_URL}/Practitioner/${id}`, {
    headers: {
      Accept: "application/fhir+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch FHIR Practitioner");
  }

  return response.json();
};


// ===============================
// FHIR APPOINTMENT
// ===============================
export const getFhirAppointment = async (id) => {
  const response = await fetch(`${API_URL}/Appointment/${id}`, {
    headers: {
      Accept: "application/fhir+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch FHIR Appointment");
  }

  return response.json();
};


// ===============================
// FHIR MEDICATION REQUEST
// ===============================
export const getFhirMedicationRequest = async (id) => {
  const response = await fetch(`${API_URL}/MedicationRequest/${id}`, {
    headers: {
      Accept: "application/fhir+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch FHIR Medication Request");
  }

  return response.json();
};