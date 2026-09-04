import { useState } from "react";
import { getFhirPatient } from "../../services/fhirService";

function FhirPatient() {
  const [patientId, setPatientId] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!patientId.trim()) {
      setError("Please enter a Patient ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPatientData(null);

      const data = await getFhirPatient(patientId.trim());

      setPatientData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch FHIR Patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fhir-resource-container">
      <h2>FHIR Patient Resource</h2>

      <p className="fhir-description">
        Retrieve a patient from the MediSphere backend in FHIR format.
      </p>

      <div className="fhir-search">
        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Get FHIR Patient"}
        </button>
      </div>

      {error && (
        <div className="fhir-error">
          {error}
        </div>
      )}

      {patientData && (
        <div className="fhir-json-container">
          <h3>FHIR Response</h3>

          <pre>
            {JSON.stringify(patientData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default FhirPatient;