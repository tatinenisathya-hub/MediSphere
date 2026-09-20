const API_URL = "http://localhost:8080/api/doctor-notifications";

export const getAllDoctorNotifications = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch doctor notifications");
  }

  return response.json();
};