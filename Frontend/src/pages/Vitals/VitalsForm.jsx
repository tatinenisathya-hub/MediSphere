import { useEffect, useState } from "react";
import {
  createVitals,
  getAllPatients,
} from "../../services/vitalsService";

function VitalsForm({ onVitalsSaved }) {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [formData, setFormData] = useState({
    patientId: "",
    heartRate: "",
    temperature: "",
    systolicBloodPressure: "",
    diastolicBloodPressure: "",
    oxygenSaturation: "",
    respiratoryRate: "",
  });

  const [loading, setLoading] = useState(false);

  // Load patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);

        const data = await getAllPatients();

        setPatients(data);
      } catch (error) {
        console.error(
          "Error fetching patients:",
          error
        );
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const vitalsData = {
        patientId: formData.patientId,
        heartRate: Number(formData.heartRate),
        temperature: Number(formData.temperature),
        systolicBloodPressure: Number(
          formData.systolicBloodPressure
        ),
        diastolicBloodPressure: Number(
          formData.diastolicBloodPressure
        ),
        oxygenSaturation: Number(
          formData.oxygenSaturation
        ),
        respiratoryRate: Number(
          formData.respiratoryRate
        ),
      };

      await createVitals(vitalsData);

      alert("Vitals saved successfully!");

      setFormData({
        patientId: "",
        heartRate: "",
        temperature: "",
        systolicBloodPressure: "",
        diastolicBloodPressure: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      });

      if (onVitalsSaved) {
        onVitalsSaved();
      }
    } catch (error) {
      alert(error.message);
      console.error(
        "Error saving vitals:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vitals-card">
      <h2>Record Patient Vitals</h2>

      <form onSubmit={handleSubmit}>

        {/* Patient Dropdown */}
        <select
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          required
          disabled={loadingPatients}
        >
          <option value="">
            {loadingPatients
              ? "Loading patients..."
              : "Select Patient"}
          </option>

          {patients.map((patient) => (
            <option
              key={patient.id}
              value={patient.id}
            >
              {patient.name}
              {patient.age
                ? ` - Age ${patient.age}`
                : ""}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="heartRate"
          placeholder="Heart Rate (BPM)"
          value={formData.heartRate}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          step="0.1"
          name="temperature"
          placeholder="Temperature (°C)"
          value={formData.temperature}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="systolicBloodPressure"
          placeholder="Systolic Blood Pressure"
          value={formData.systolicBloodPressure}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="diastolicBloodPressure"
          placeholder="Diastolic Blood Pressure"
          value={formData.diastolicBloodPressure}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="oxygenSaturation"
          placeholder="Oxygen Saturation (%)"
          value={formData.oxygenSaturation}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="respiratoryRate"
          placeholder="Respiratory Rate"
          value={formData.respiratoryRate}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading || loadingPatients}
        >
          {loading
            ? "Saving..."
            : "Save Vitals"}
        </button>
      </form>
    </div>
  );
}

export default VitalsForm;