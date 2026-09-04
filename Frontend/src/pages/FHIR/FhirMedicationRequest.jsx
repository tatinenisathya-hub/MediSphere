import { useState } from "react";
import { getFhirMedicationRequest } from "../../services/fhirService";

function FhirMedicationRequest() {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [medicationData, setMedicationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!prescriptionId.trim()) {
      setError("Please enter a Prescription ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMedicationData(null);

      const data = await getFhirMedicationRequest(prescriptionId.trim());

      setMedicationData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch FHIR MedicationRequest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fhir-resource-container">
      <h2>FHIR MedicationRequest Resource</h2>

      <p className="fhir-description">
        Retrieve a prescription from MediSphere in HL7 FHIR MedicationRequest format.
      </p>

      <div className="fhir-search">
        <input
          type="text"
          placeholder="Enter Prescription ID"
          value={prescriptionId}
          onChange={(e) => setPrescriptionId(e.target.value)}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Get FHIR MedicationRequest"}
        </button>
      </div>

      {error && (
        <div className="fhir-error">
          {error}
        </div>
      )}

      {medicationData && (
        <div className="fhir-json-container">
          <h3>FHIR Response</h3>

          <pre>{JSON.stringify(medicationData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default FhirMedicationRequest;