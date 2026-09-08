const API_URL = "http://localhost:8080/api/patient-twins";

// =====================================
// GET ALL PATIENT TWINS
// =====================================

export const getAllPatientTwins = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      "Failed to fetch patient twins"
    );
  }

  return response.json();
};


// =====================================
// GET PATIENT TWIN BY TWIN ID
// =====================================

export const getPatientTwinById = async (id) => {
  const response = await fetch(
    `${API_URL}/${id}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch patient twin"
    );
  }

  return response.json();
};


// =====================================
// GET PATIENT TWIN BY PATIENT ID
// =====================================

export const getPatientTwinByPatientId = async (
  patientId
) => {
  const response = await fetch(
    `${API_URL}/patient/${patientId}`
  );

  if (!response.ok) {
    throw new Error(
      "Patient twin not found"
    );
  }

  return response.json();
};


// =====================================
// GENERATE PATIENT DIGITAL TWIN
// =====================================

export const generatePatientTwin = async (
  patientId
) => {
  const response = await fetch(
    `${API_URL}/generate/${patientId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate patient digital twin"
    );
  }

  return response.json();
};


// =====================================
// REFRESH PATIENT DIGITAL TWIN
// =====================================

export const refreshPatientTwin = async (
  patientId
) => {
  const response = await fetch(
    `${API_URL}/refresh/${patientId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to refresh patient digital twin"
    );
  }

  return response.json();
};


// =====================================
// DELETE PATIENT TWIN
// =====================================

export const deletePatientTwin = async (
  id
) => {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete patient twin"
    );
  }

  return true;
};