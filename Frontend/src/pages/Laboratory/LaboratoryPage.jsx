import { useEffect, useState } from "react";
import Header from "../../components/Header";
import LaboratoryForm from "./LaboratoryForm";
import LaboratoryList from "./LaboratoryList";
import { getAllLabResults } from "../../services/laboratoryService";
import { getPatients } from "../../services/patientService";
import "./Laboratory.css";

function LaboratoryPage() {
  const [results, setResults] = useState([]);
  const [patients, setPatients] = useState([]);
  const [editingResult, setEditingResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [labResponse, patientData] = await Promise.all([
        getAllLabResults(),
        getPatients(),
      ]);

      setResults(
        Array.isArray(labResponse)
          ? labResponse
          : []
      );

      setPatients(
        Array.isArray(patientData)
          ? patientData
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load laboratory data."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSaved() {
    setEditingResult(null);
    loadData();
  }

  function handleCancelEdit() {
    setEditingResult(null);
  }

  return (
    <>
      <Header
        title="Laboratory Results"
        description="Laboratory data for the patient digital twin"
      />

      {error && (
        <div className="laboratory-error page-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="patient-list-card">
          <p>Loading laboratory data...</p>
        </div>
      ) : (
        <>
          <LaboratoryForm
            editingResult={editingResult}
            onSaved={handleSaved}
            onCancel={handleCancelEdit}
          />

          <LaboratoryList
            results={results}
            patients={patients}
            onEdit={setEditingResult}
            onRefresh={loadData}
          />
        </>
      )}
    </>
  );
}

export default LaboratoryPage;