const API_URL = "http://localhost:8080/api/appointments";

export const getAppointments = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch appointments");
  return response.json();
};

export const createAppointment = async (appointment) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
  if (!response.ok) throw new Error("Failed to create appointment");
  return response.json();
};

export const updateAppointment = async (id, appointment) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
  if (!response.ok) throw new Error("Failed to update appointment");
  return response.json();
};

export const deleteAppointment = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete appointment");
};