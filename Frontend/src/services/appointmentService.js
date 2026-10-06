const API_URL = "http://localhost:8080/api/appointments";

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

// Get all appointments
export const getAppointments = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return response.json();
};

// Get appointments by patient ID
export const getAppointmentsByPatientId = async (patientId) => {
  const response = await fetch(`${API_URL}/patient/${patientId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patient appointments");
  }

  return response.json();
};

// Get appointment by ID
export const getAppointmentById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointment");
  }

  return response.json();
};

// Create appointment
export const createAppointment = async (appointment) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(appointment),
  });

  if (!response.ok) {
    throw new Error("Failed to create appointment");
  }

  return response.json();
};

// Update appointment
export const updateAppointment = async (id, appointment) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(appointment),
  });

  if (!response.ok) {
    throw new Error("Failed to update appointment");
  }

  return response.json();
};

// Delete appointment
export const deleteAppointment = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete appointment");
  }

  return true;
};