const API_URL = "http://localhost:8080/api/doctors";

export const getDoctors = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch doctors");
  return response.json();
};

export const createDoctor = async (doctor) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doctor),
  });
  if (!response.ok) throw new Error("Failed to add doctor");
  return response.json();
};

export const updateDoctor = async (id, doctor) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doctor),
  });
  if (!response.ok) throw new Error("Failed to update doctor");
  return response.json();
};

export const deleteDoctor = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete doctor");
};