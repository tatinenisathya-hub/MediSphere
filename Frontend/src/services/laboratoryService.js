const API_BASE_URL = "http://localhost:8080/api/laboratory";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      if (contentType.includes("application/json")) {
        const error = await response.json();
        message = error.message || error.error || message;
      } else {
        const text = await response.text();
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

export async function getAllLabResults() {
  const response = await fetch(API_BASE_URL);
  return handleResponse(response);
}

export async function getLabResultsByPatient(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/patient/${encodeURIComponent(patientId)}`
  );

  return handleResponse(response);
}

export async function getLabResultById(id) {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`
  );

  return handleResponse(response);
}

export async function createLabResult(labResult) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(labResult),
  });

  return handleResponse(response);
}

export async function updateLabResult(id, labResult) {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(labResult),
    }
  );

  return handleResponse(response);
}

export async function deleteLabResult(id) {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}