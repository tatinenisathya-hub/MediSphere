import { useState } from "react";
import { getFhirAppointment } from "../../services/fhirService";

function FhirAppointment() {
  const [appointmentId, setAppointmentId] = useState("");
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!appointmentId.trim()) {
      setError("Please enter an Appointment ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAppointmentData(null);

      const data = await getFhirAppointment(appointmentId.trim());

      setAppointmentData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch FHIR Appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fhir-resource-container">
      <h2>FHIR Appointment Resource</h2>

      <p className="fhir-description">
        Retrieve an appointment from MediSphere in HL7 FHIR Appointment format.
      </p>

      <div className="fhir-search">
        <input
          type="text"
          placeholder="Enter Appointment ID"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Get FHIR Appointment"}
        </button>
      </div>

      {error && (
        <div className="fhir-error">
          {error}
        </div>
      )}

      {appointmentData && (
        <div className="fhir-json-container">
          <h3>FHIR Response</h3>

          <pre>{JSON.stringify(appointmentData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default FhirAppointment;