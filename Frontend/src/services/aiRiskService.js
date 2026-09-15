import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/ai";

// ---------------------------------------------------------
// AI service health
// ---------------------------------------------------------

export const getAiHealth = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/health`
  );

  return response.data;
};

// ---------------------------------------------------------
// AI model status
// ---------------------------------------------------------

export const getAiModelStatus = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/models`
  );

  return response.data;
};

// ---------------------------------------------------------
// Cardiovascular AI prediction
// ---------------------------------------------------------

export const predictCardiovascularRisk = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/cardiovascular/predict`,
    data
  );

  return response.data;
};

// ---------------------------------------------------------
// Diabetes AI prediction
// ---------------------------------------------------------

export const predictDiabetesRisk = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/diabetes/predict`,
    data
  );

  return response.data;
};

// ---------------------------------------------------------
// Load the latest two saved predictions for each model
// ---------------------------------------------------------

export const getAiRiskHistory = async (patientId) => {
  if (!patientId) {
    return {
      cardiovascular: [],
      diabetes: [],
    };
  }

  const response = await axios.get(
    `${API_BASE_URL}/risk-history/${encodeURIComponent(patientId)}`
  );

  return response.data;
};

// ---------------------------------------------------------
// Save one completed AI prediction
// ---------------------------------------------------------

export const saveAiRiskHistory = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/history`,
    data
  );

  return response.data;
};