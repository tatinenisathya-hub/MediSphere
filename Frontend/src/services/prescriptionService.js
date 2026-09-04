const API_URL = "http://localhost:8080/api/prescriptions";

export const getPrescriptions = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch prescriptions");
  return response.json();
};

export const createPrescription = async (prescription) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prescription),
  });
  if (!response.ok) throw new Error("Failed to create prescription");
  return response.json();
};

export const updatePrescription = async (id, prescription) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prescription),
  });
  if (!response.ok) throw new Error("Failed to update prescription");
  return response.json();
};

export const deletePrescription = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete prescription");
};