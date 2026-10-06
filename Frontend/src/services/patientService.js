const API_URL = "http://localhost:8080/api/patients";

// Add JWT token to authenticated requests
const getAuthHeaders = (includeContentType = false) => {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Get all patients
export const getPatients = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
};

// Get patient by ID
export const getPatientById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patient");
  }

  return response.json();
};

// Create patient
export const createPatient = async (patient) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    throw new Error("Failed to add patient");
  }

  return response.json();
};

// Update patient
export const updatePatient = async (id, patient) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    throw new Error("Failed to update patient");
  }

  return response.json();
};

// Delete patient
export const deletePatient = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete patient");
  }

  return true;
};