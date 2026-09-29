const API_URL = "http://localhost:8080/api/care-plans";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}

export const getCarePlans = (patientId) =>
  request(`${API_URL}/patient/${encodeURIComponent(patientId)}`);

export const generateCarePlan = (patientId) =>
  request(`${API_URL}/generate?patientId=${encodeURIComponent(patientId)}`, { method: "POST" });

export const updateCarePlanAdherence = (planId, itemId, status, notes = "") =>
  request(`${API_URL}/${encodeURIComponent(planId)}/items/${encodeURIComponent(itemId)}/adherence`, {
    method: "PATCH", body: JSON.stringify({ status, notes }),
  });

export const addCarePlanOutcome = (planId, outcome) =>
  request(`${API_URL}/${encodeURIComponent(planId)}/outcomes`, {
    method: "POST", body: JSON.stringify(outcome),
  });

export const approveCarePlan = (planId, approvedBy) =>
  request(`${API_URL}/${encodeURIComponent(planId)}/approval`, {
    method: "PATCH", body: JSON.stringify({ approvedBy }),
  });