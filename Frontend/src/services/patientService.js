const API_URL = "http://localhost:8080/api/patients";

export const getPatients = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch patients");
  return response.json();
};

export const createPatient = async (patient) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });
  if (!response.ok) throw new Error("Failed to add patient");
  return response.json();
};

export const updatePatient = async (id, patient) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });
  if (!response.ok) throw new Error("Failed to update patient");
  return response.json();
};

export const deletePatient = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete patient");
};