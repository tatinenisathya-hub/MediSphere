const BASE_URL = "http://localhost:8080/api/consents";

// Add JWT token to authenticated requests
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

/**
 * Grant a new consent for a patient.
 */
export const grantConsent = async (consent) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(consent),
  });

  if (!response.ok) {
    let errorMessage = "Failed to grant consent";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Get all consents belonging to a patient.
 */
export const getPatientConsents = async (patientId) => {
  const response = await fetch(
    `${BASE_URL}/patient/${encodeURIComponent(patientId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to fetch patient consents";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Revoke an existing consent.
 */
export const revokeConsent = async (consentId) => {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(consentId)}/revoke`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to revoke consent";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Check whether a patient currently has an active consent
 * for a particular consent type.
 */
export const checkConsent = async (
  patientId,
  consentType
) => {
  const params = new URLSearchParams({
    patientId,
    consentType,
  });

  const response = await fetch(
    `${BASE_URL}/check?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to check consent";

    try {
      const errorText = await response.text();

      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
};