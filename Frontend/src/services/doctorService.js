const API_URL = "http://localhost:8080/api/doctors";

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

// Get all doctors
export const getDoctors = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }

  return response.json();
};

// Create doctor
export const createDoctor = async (doctor) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(doctor),
  });

  if (!response.ok) {
    throw new Error("Failed to add doctor");
  }

  return response.json();
};

// Update doctor
export const updateDoctor = async (id, doctor) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(doctor),
  });

  if (!response.ok) {
    throw new Error("Failed to update doctor");
  }

  return response.json();
};

// Delete doctor
export const deleteDoctor = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete doctor");
  }

  return true;
};