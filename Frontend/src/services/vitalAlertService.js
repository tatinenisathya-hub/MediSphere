const API_URL = "http://localhost:8080/api/alerts";

// =========================================================
// Authentication headers
// =========================================================

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


// =========================================================
// Get all alerts
// =========================================================

export const getAllAlerts = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = "Failed to fetch alerts";

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

  return response.json();
};


// =========================================================
// Get alerts for a specific patient
// =========================================================

export const getAlertsByPatientId = async (patientId) => {
  if (!patientId) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/patient/${encodeURIComponent(patientId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to fetch patient alerts";

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

  return response.json();
};


// =========================================================
// Get all open alerts
// =========================================================

export const getOpenAlerts = async () => {
  const response = await fetch(`${API_URL}/open`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = "Failed to fetch open alerts";

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

  return response.json();
};


// =========================================================
// Update alert status
// =========================================================

export const updateAlertStatus = async (alertId, status) => {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(alertId)}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to update alert status";

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

  return response.json();
};