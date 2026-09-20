const API_URL = "http://localhost:8080/api/alerts";

// Get all alerts
export const getAllAlerts = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }

  return response.json();
};

// Get alerts for a specific patient
export const getAlertsByPatientId = async (patientId) => {
  if (!patientId) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/patient/${encodeURIComponent(patientId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch patient alerts");
  }

  return response.json();
};

// Get all open alerts
export const getOpenAlerts = async () => {
  const response = await fetch(`${API_URL}/open`);

  if (!response.ok) {
    throw new Error("Failed to fetch open alerts");
  }

  return response.json();
};

// Update alert status
export const updateAlertStatus = async (alertId, status) => {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(alertId)}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update alert status");
  }

  return response.json();
};