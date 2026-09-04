import { useState } from "react";
import { getFhirPractitioner } from "../../services/fhirService";

function FhirPractitioner() {
  const [practitionerId, setPractitionerId] = useState("");
  const [practitionerData, setPractitionerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!practitionerId.trim()) {
      setError("Please enter a Doctor ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPractitionerData(null);

      const data = await getFhirPractitioner(practitionerId.trim());

      setPractitionerData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch FHIR Practitioner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fhir-resource-container">
      <h2>FHIR Practitioner Resource</h2>

      <p className="fhir-description">
        Retrieve a doctor from MediSphere in HL7 FHIR Practitioner format.
      </p>

      <div className="fhir-search">
        <input
          type="text"
          placeholder="Enter Doctor ID"
          value={practitionerId}
          onChange={(e) => setPractitionerId(e.target.value)}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Get FHIR Practitioner"}
        </button>
      </div>

      {error && (
        <div className="fhir-error">
          {error}
        </div>
      )}

      {practitionerData && (
        <div className="fhir-json-container">
          <h3>FHIR Response</h3>

          <pre>{JSON.stringify(practitionerData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default FhirPractitioner;