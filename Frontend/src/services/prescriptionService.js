const API_URL = "http://localhost:8080/api/prescriptions";

// Get authentication headers
const getAuthHeaders = (includeContentType = false) => {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Get all prescriptions
export const getPrescriptions = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prescriptions");
  }

  return response.json();
};

// Get prescriptions by patient ID
export const getPrescriptionsByPatientId = async (patientId) => {
  const response = await fetch(`${API_URL}/patient/${patientId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patient prescriptions");
  }

  return response.json();
};

// Get prescription by ID
export const getPrescriptionById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prescription");
  }

  return response.json();
};

// Create prescription
export const createPrescription = async (prescription) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    throw new Error("Failed to create prescription");
  }

  return response.json();
};

// Update prescription
export const updatePrescription = async (id, prescription) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    throw new Error("Failed to update prescription");
  }

  return response.json();
};

// Delete prescription
export const deletePrescription = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete prescription");
  }

  return true;
};