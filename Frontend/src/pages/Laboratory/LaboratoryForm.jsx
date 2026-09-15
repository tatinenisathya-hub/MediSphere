import { useEffect, useState } from "react";
import {
  createLabResult,
  updateLabResult,
} from "../../services/laboratoryService";

const PATIENT_API_URL = "http://localhost:8080/api/patients";

const emptyForm = {
  patientId: "",
  testName: "",
  testCode: "",
  value: "",
  unit: "",
  referenceRange: "",
  status: "FINAL",
  performedAt: "",
};

function LaboratoryForm({ editingResult, onSaved, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (editingResult) {
      setForm({
        patientId: editingResult.patientId || "",
        testName: editingResult.testName || "",
        testCode: editingResult.testCode || "",
        value:
          editingResult.value !== null &&
          editingResult.value !== undefined
            ? String(editingResult.value)
            : "",
        unit: editingResult.unit || "",
        referenceRange: editingResult.referenceRange || "",
        status: editingResult.status || "FINAL",
        performedAt: editingResult.performedAt
          ? editingResult.performedAt.substring(0, 16)
          : "",
      });
    } else {
      setForm(emptyForm);
    }

    setError("");
  }, [editingResult]);

  async function loadPatients() {
    try {
      const response = await fetch(PATIENT_API_URL);

      if (!response.ok) {
        throw new Error("Unable to load patients");
      }

      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load patients");
    } finally {
      setLoadingPatients(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!form.testName.trim()) {
      setError("Test name is required.");
      return;
    }

    if (form.value === "") {
      setError("Test value is required.");
      return;
    }

    if (!form.performedAt) {
      setError("Performed date and time are required.");
      return;
    }

    const numericValue = Number(form.value);

    if (Number.isNaN(numericValue)) {
      setError("Test value must be a valid number.");
      return;
    }

    const payload = {
      patientId: form.patientId,
      testName: form.testName.trim(),
      testCode: form.testCode.trim(),
      value: numericValue,
      unit: form.unit.trim(),
      referenceRange: form.referenceRange.trim(),
      status: form.status,
      performedAt: form.performedAt,
    };

    try {
      setSaving(true);

      if (editingResult) {
        await updateLabResult(editingResult.id, payload);
      } else {
        await createLabResult(payload);
      }

      setForm(emptyForm);
      onSaved();
    } catch (err) {
      setError(err.message || "Unable to save laboratory result.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="laboratory-form-card">
      <div className="laboratory-section-header">
        <div>
          <h2>
            {editingResult
              ? "Edit Laboratory Result"
              : "Add Laboratory Result"}
          </h2>

          <p>
            Store a laboratory measurement for an existing MediSphere
            patient.
          </p>
        </div>
      </div>

      {error && (
        <div className="laboratory-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="laboratory-form">
        <div className="laboratory-form-grid">
          <div className="form-group">
            <label htmlFor="patientId">Patient *</label>

            <select
              id="patientId"
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              disabled={loadingPatients || saving}
            >
              <option value="">
                {loadingPatients
                  ? "Loading patients..."
                  : "Select patient"}
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} — {patient.id}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="testName">Test Name *</label>

            <input
              id="testName"
              name="testName"
              type="text"
              value={form.testName}
              onChange={handleChange}
              placeholder="Example: HbA1c"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="testCode">Test Code</label>

            <input
              id="testCode"
              name="testCode"
              type="text"
              value={form.testCode}
              onChange={handleChange}
              placeholder="Optional code"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="value">Value *</label>

            <input
              id="value"
              name="value"
              type="number"
              step="any"
              value={form.value}
              onChange={handleChange}
              placeholder="Enter measured value"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>

            <input
              id="unit"
              name="unit"
              type="text"
              value={form.unit}
              onChange={handleChange}
              placeholder="Example: % or mg/dL"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="referenceRange">
              Reference Range
            </label>

            <input
              id="referenceRange"
              name="referenceRange"
              type="text"
              value={form.referenceRange}
              onChange={handleChange}
              placeholder="Example: 4.0 - 5.6"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="FINAL">Final</option>
              <option value="PRELIMINARY">Preliminary</option>
              <option value="CORRECTED">Corrected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="performedAt">
              Performed Date & Time *
            </label>

            <input
              id="performedAt"
              name="performedAt"
              type="datetime-local"
              value={form.performedAt}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="laboratory-form-actions">
          {editingResult && (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={saving || loadingPatients}
          >
            {saving
              ? "Saving..."
              : editingResult
                ? "Update Result"
                : "Add Result"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LaboratoryForm;