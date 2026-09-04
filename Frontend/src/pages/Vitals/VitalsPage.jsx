import { useEffect, useState } from "react";
import Header from "../../components/Header";
import VitalsForm from "./VitalsForm";
import VitalsList from "./VitalsList";

import {
  getAllVitals,
  getAllPatients,
} from "../../services/vitalsService";

import "./Vitals.css";

function VitalsPage() {
  const [vitals, setVitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all vitals
  const fetchVitals = async () => {
    try {
      setLoading(true);

      const data = await getAllVitals();

      setVitals(data);
    } catch (error) {
      console.error("Error fetching vitals:", error);
      setVitals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();

      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  // Load vitals and patients when page opens
  useEffect(() => {
    fetchVitals();
    fetchPatients();
  }, []);

  return (
    <>
      <Header
        title="Patient Vitals"
        description="Record and monitor patient vital signs"
      />

      <div className="vitals-container">
        {/* Vitals Form */}
        <VitalsForm
          onVitalsSaved={fetchVitals}
        />

        {/* Vitals Records */}
        <div className="vitals-card">
          <div className="vitals-list-header">
            <h2>Vitals Records</h2>

            <button
              onClick={fetchVitals}
              className="refresh-button"
            >
              Refresh
            </button>
          </div>

          <VitalsList
            vitals={vitals}
            patients={patients}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}

export default VitalsPage;