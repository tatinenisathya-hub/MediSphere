const API_URL = "http://localhost:8080/api/vitals";

export const getAllVitals = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch vitals");
  }

  return response.json();
};

export const getVitalsByPatientId = async (patientId) => {
  const response = await fetch(`${API_URL}/patient/${patientId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch patient vitals");
  }

  return response.json();
};

export const createVitals = async (vitalsData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vitalsData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to save vitals"
    );
  }

  return response.json();
};