import { useEffect, useState } from "react";

import Header from "../../components/Header";
import Message from "../../components/Message";
import FhirViewer from "../../components/FhirViewer";

import VitalsForm from "./VitalsForm";
import VitalsList from "./VitalsList";

import {
  getAllVitals,
  getAllPatients,
} from "../../services/vitalsService";

import {
  getFhirObservation,
} from "../../services/fhirService";

import "./Vitals.css";


function VitalsPage() {

  const [vitals, setVitals] = useState([]);

  const [patients, setPatients] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  // ===============================
  // FHIR STATES
  // ===============================

  const [fhirData, setFhirData] =
    useState(null);

  const [fhirLoading, setFhirLoading] =
    useState(false);


  // ===============================
  // FETCH ALL VITALS
  // ===============================

  const fetchVitals = async () => {

    try {

      setLoading(true);

      const data =
        await getAllVitals();

      setVitals(data || []);

    } catch (error) {

      console.error(
        "Error fetching vitals:",
        error
      );

      setVitals([]);

      setMessage(
        "Unable to fetch vital records."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===============================
  // FETCH ALL PATIENTS
  // ===============================

  const fetchPatients = async () => {

    try {

      const data =
        await getAllPatients();

      setPatients(data || []);

    } catch (error) {

      console.error(
        "Error fetching patients:",
        error
      );

      setPatients([]);

    }

  };


  // ===============================
  // LOAD DATA
  // ===============================

  useEffect(() => {

    fetchVitals();

    fetchPatients();

  }, []);


  // ===============================
  // REFRESH ALL DATA
  // ===============================

  const handleRefresh = async () => {

    setMessage("");

    await Promise.all([
      fetchVitals(),
      fetchPatients(),
    ]);

  };


  // ===============================
  // VIEW FHIR OBSERVATION
  // ===============================

  const handleViewFhir =
    async (vitalId) => {

      if (!vitalId) {

        setMessage(
          "Invalid vital record ID."
        );

        return;

      }


      try {

        setFhirLoading(true);

        setMessage("");

        // Clear previous FHIR data
        setFhirData(null);


        const data =
          await getFhirObservation(
            vitalId
          );


        console.log(
          "FHIR Observation Response:",
          data
        );


        if (
          !data ||
          (
            typeof data === "object" &&
            Object.keys(data).length === 0
          )
        ) {

          setMessage(
            "No FHIR Observation data available."
          );

          return;

        }


        setFhirData(
          data
        );

      } catch (error) {

        console.error(
          "Error fetching FHIR Observation:",
          error
        );

        setMessage(
          "Failed to fetch FHIR Observation data."
        );

      } finally {

        setFhirLoading(false);

      }

    };


  // ===============================
  // CLOSE FHIR VIEWER
  // ===============================

  const handleCloseFhir = () => {

    setFhirData(null);

  };


  return (

    <>

      <Header
        title="Patient Vitals"
        description="Record and monitor patient vital signs"
      />


      <Message
        message={message}
      />


      <div className="vitals-container">


        {/* ===============================
            VITALS FORM
        =============================== */}

        <VitalsForm
          onVitalsSaved={fetchVitals}
        />


        {/* ===============================
            VITALS RECORDS
        =============================== */}

        <div className="vitals-card">

          <div className="vitals-list-header">

            <h2>
              Vitals Records
            </h2>


            <button
              onClick={handleRefresh}
              className="refresh-button"
            >
              Refresh
            </button>

          </div>


          <VitalsList

            vitals={vitals}

            patients={patients}

            loading={loading}

            onViewFhir={handleViewFhir}

            fhirLoading={fhirLoading}

          />

        </div>

      </div>


      {/* ===============================
          FHIR LOADING
      =============================== */}

      {fhirLoading && (

        <div className="fhir-loading">

          Loading FHIR Observation...

        </div>

      )}


      {/* ===============================
          FHIR VIEWER
      =============================== */}

      {fhirData && (

        <FhirViewer

          fhirData={fhirData}

          title="FHIR Observation"

          onClose={handleCloseFhir}

        />

      )}

    </>

  );

}


export default VitalsPage;