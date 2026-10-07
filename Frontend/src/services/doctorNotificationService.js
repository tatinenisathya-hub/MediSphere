const API_URL = "http://localhost:8080/api/doctor-notifications";

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
// Get all doctor notifications
// =========================================================

export const getAllDoctorNotifications = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = "Failed to fetch doctor notifications";

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