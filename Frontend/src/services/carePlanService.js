const API_URL = "http://localhost:8080/api/care-plans";

// ==========================================
// AUTH HEADERS
// ==========================================

const getAuthHeaders = (includeContentType = false) => {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// ==========================================
// COMMON REQUEST FUNCTION
// ==========================================

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(options.body !== undefined),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

// ==========================================
// GET CARE PLANS FOR PATIENT
// ==========================================

export const getCarePlans = (patientId) =>
  request(
    `${API_URL}/patient/${encodeURIComponent(patientId)}`
  );

// ==========================================
// GENERATE CARE PLAN
// ==========================================

export const generateCarePlan = (patientId) =>
  request(
    `${API_URL}/generate?patientId=${encodeURIComponent(patientId)}`,
    {
      method: "POST",
    }
  );

// ==========================================
// UPDATE INTERVENTION ADHERENCE
// ==========================================

export const updateCarePlanAdherence = (
  planId,
  itemId,
  status,
  notes = ""
) =>
  request(
    `${API_URL}/${encodeURIComponent(
      planId
    )}/items/${encodeURIComponent(itemId)}/adherence`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        notes,
      }),
    }
  );

// ==========================================
// ADD HEALTH OUTCOME
// ==========================================

export const addCarePlanOutcome = (
  planId,
  outcome
) =>
  request(
    `${API_URL}/${encodeURIComponent(planId)}/outcomes`,
    {
      method: "POST",
      body: JSON.stringify(outcome),
    }
  );

// ==========================================
// APPROVE CARE PLAN
// ==========================================

export const approveCarePlan = (
  planId,
  approvedBy
) =>
  request(
    `${API_URL}/${encodeURIComponent(planId)}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify({
        approvedBy,
      }),
    }
  );