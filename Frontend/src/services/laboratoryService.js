const API_BASE_URL =
  "http://localhost:8080/api/laboratory";

// Add JWT token to authenticated requests
const getAuthHeaders = (
  includeContentType = false
) => {
  const token =
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] =
      "application/json";
  }

  return headers;
};

async function handleResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    try {
      if (
        contentType.includes(
          "application/json"
        )
      ) {
        const error =
          await response.json();

        message =
          error.message ||
          error.error ||
          message;
      } else {
        const text =
          await response.text();

        if (text) {
          message = text;
        }
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Get all laboratory results
export async function getAllLabResults() {
  const response = await fetch(
    API_BASE_URL,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

// Get laboratory results by patient
export async function getLabResultsByPatient(
  patientId
) {
  const response = await fetch(
    `${API_BASE_URL}/patient/${encodeURIComponent(
      patientId
    )}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

// Get laboratory result by ID
export async function getLabResultById(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}

// Create laboratory result
export async function createLabResult(
  labResult
) {
  const response = await fetch(
    API_BASE_URL,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(labResult),
    }
  );

  return handleResponse(response);
}

// Update laboratory result
export async function updateLabResult(
  id,
  labResult
) {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(
      id
    )}`,
    {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify(labResult),
    }
  );

  return handleResponse(response);
}

// Delete laboratory result
export async function deleteLabResult(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(
      id
    )}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
}