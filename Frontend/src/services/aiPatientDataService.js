const API_BASE_URL = "http://localhost:8080/api";

/**
 * Load all MediSphere patients.
 */
export const getAiPatients = async () => {
  const response = await fetch(`${API_BASE_URL}/patients`);

  if (!response.ok) {
    throw new Error("Unable to load patients.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};

/**
 * Load all vitals belonging to one patient.
 */
export const getAiPatientVitals = async (patientId) => {
  if (!patientId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/vitals/patient/${encodeURIComponent(patientId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load patient vitals.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};

/**
 * Load all laboratory results belonging to one patient.
 */
export const getAiPatientLabs = async (patientId) => {
  if (!patientId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/laboratory/patient/${encodeURIComponent(patientId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load patient laboratory results.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};