const API_BASE_URL = "http://localhost:8080/api";

// =========================================================
// Authentication headers
// =========================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};


// =========================================================
// Load all MediSphere patients
// =========================================================

export const getAiPatients = async () => {
  const response = await fetch(
    `${API_BASE_URL}/patients`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Unable to load patients.";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};


// =========================================================
// Load all vitals belonging to one patient
// =========================================================

export const getAiPatientVitals = async (patientId) => {
  if (!patientId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/vitals/patient/${encodeURIComponent(patientId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Unable to load patient vitals.";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};


// =========================================================
// Load all laboratory results belonging to one patient
// =========================================================

export const getAiPatientLabs = async (patientId) => {
  if (!patientId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/laboratory/patient/${encodeURIComponent(patientId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage =
      "Unable to load patient laboratory results.";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};