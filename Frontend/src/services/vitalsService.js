const API_URL = "http://localhost:8080/api/vitals";
const PATIENT_API_URL = "http://localhost:8080/api/patients";

// Get all vitals
export const getAllVitals = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch vitals");
  }

  return response.json();
};

// Get vitals by patient ID
export const getVitalsByPatientId = async (patientId) => {
  const response = await fetch(`${API_URL}/patient/${patientId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch patient vitals");
  }

  return response.json();
};

// Create vitals
export const createVitals = async (vitalsData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vitalsData),
  });

  if (!response.ok) {
    throw new Error("Failed to save vitals");
  }

  return response.json();
};

// Update vitals
export const updateVitals = async (id, vitalsData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vitalsData),
  });

  if (!response.ok) {
    throw new Error("Failed to update vitals");
  }

  return response.json();
};

// Delete vitals
export const deleteVitals = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete vitals");
  }

  return true;
};

// Get all patients
export const getAllPatients = async () => {
  const response = await fetch(PATIENT_API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
};