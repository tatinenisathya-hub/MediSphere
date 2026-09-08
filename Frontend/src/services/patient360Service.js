import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const getPatient360 = async (patientId) => {
  const response = await axios.get(
    `${API_BASE_URL}/patient-360/${patientId}`
  );

  return response.data;
};