import React, { useMemo, useState } from "react";
import "./Patient360.css";
import { getPatient360 } from "../../services/patient360Service";

const Patient360Page = () => {
  const [patientId, setPatientId] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPatient360 = async () => {
    if (!patientId.trim()) {
      setError("Please enter a Patient ID");
      setPatientData(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getPatient360(patientId.trim());

      setPatientData(data);
    } catch (err) {
      console.error("Patient 360 error:", err);

      setError("Unable to load Patient 360 data");
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const patient = patientData?.patient;
  const twin = patientData?.patientTwin;

  const vitals = patientData?.vitals ?? [];
  const appointments = patientData?.appointments ?? [];
  const prescriptions = patientData?.prescriptions ?? [];
  const doctors = patientData?.doctors ?? [];

  /*
   * Find the most recently recorded vital.
   *
   * Your backend returns recordedAt in ISO local-date-time format.
   */
  const latestVital = useMemo(() => {
    if (!vitals.length) {
      return null;
    }

    return [...vitals].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() -
        new Date(a.recordedAt).getTime()
    )[0];
  }, [vitals]);

  const formatValue = (value, unit = "") => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getSourceLabel = (vital) => {
    if (!vital?.source) {
      return "Clinical";
    }

    return vital.source;
  };

  return (
    <div className="patient360-container">

      {/* HEADER */}

      <div className="patient360-header">
        <div>
          <h1>Patient 360°</h1>
          <p>Complete patient healthcare overview</p>
        </div>
      </div>


      {/* PATIENT SEARCH */}

      <div className="patient-search-card">

        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchPatient360();
            }
          }}
        />

        <button onClick={fetchPatient360}>
          View Patient
        </button>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="loading">
          Loading Patient 360 data...
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* PATIENT DATA */}

      {patientData && !loading && (

        <div className="patient360-content">


          {/* ========================= */}
          {/* PATIENT PROFILE */}
          {/* ========================= */}

          <div className="profile-card">

            <div className="profile-avatar">
              {patient?.name?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div className="profile-details">

              <h2>
                {patient?.name || "Unknown Patient"}
              </h2>

              <p>
                <strong>Patient ID:</strong>{" "}
                {patient?.id || "Not available"}
              </p>

              <p>
                <strong>Age:</strong>{" "}
                {patient?.age ?? "Not available"}
              </p>

              <p>
                <strong>Gender:</strong>{" "}
                {patient?.gender || "Not available"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {patient?.phone || "Not available"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {patient?.email || "Not available"}
              </p>

            </div>

          </div>


          {/* ========================= */}
          {/* DIGITAL TWIN */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              🔄 Digital Twin
            </div>

            <div className="info-grid">

              <div className="info-box">
                <span>Patient ID</span>

                <strong>
                  {twin?.patientId ?? patient?.id ?? "Not available"}
                </strong>
              </div>


              <div className="info-box">
                <span>Patient Name</span>

                <strong>
                  {twin?.patientName ?? patient?.name ?? "Not available"}
                </strong>
              </div>


              <div className="info-box">
                <span>Age</span>

                <strong>
                  {twin?.age ?? patient?.age ?? "Not available"}
                </strong>
              </div>


              <div className="info-box">
                <span>Digital Twin Status</span>

                <strong className="status-active">
                  Active
                </strong>
              </div>


              <div className="info-box">
                <span>Appointments Linked</span>

                <strong>
                  {twin?.appointmentIds?.length ?? 0}
                </strong>
              </div>


              <div className="info-box">
                <span>Prescriptions Linked</span>

                <strong>
                  {twin?.prescriptionIds?.length ?? 0}
                </strong>
              </div>


              <div className="info-box">
                <span>Vitals Linked</span>

                <strong>
                  {twin?.vitalIds?.length ?? 0}
                </strong>
              </div>


              <div className="info-box">
                <span>Last Updated</span>

                <strong>
                  {formatDateTime(twin?.updatedAt)}
                </strong>
              </div>

            </div>

          </div>


          {/* ========================= */}
          {/* HEALTH SUMMARY */}
          {/* ========================= */}

          <div className="summary-grid">

            <div className="summary-card">
              <span className="summary-icon">
                ❤️
              </span>

              <div>
                <h3>Vitals</h3>

                <p>
                  {vitals.length} recorded vital
                  {vitals.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>


            <div className="summary-card">
              <span className="summary-icon">
                📅
              </span>

              <div>
                <h3>Appointments</h3>

                <p>
                  {appointments.length} appointment
                  {appointments.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>


            <div className="summary-card">
              <span className="summary-icon">
                💊
              </span>

              <div>
                <h3>Prescriptions</h3>

                <p>
                  {prescriptions.length} prescription
                  {prescriptions.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>


            <div className="summary-card">
              <span className="summary-icon">
                🔐
              </span>

              <div>
                <h3>Consent</h3>

                <p>
                  Healthcare data permissions
                </p>
              </div>
            </div>

          </div>


          {/* ========================= */}
          {/* LATEST VITAL */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              ❤️ Latest Vital
            </div>

            {latestVital ? (

              <>

                <div className="info-grid">

                  <div className="info-box">
                    <span>Heart Rate</span>

                    <strong>
                      {formatValue(
                        latestVital.heartRate,
                        "BPM"
                      )}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Temperature</span>

                    <strong>
                      {formatValue(
                        latestVital.temperature,
                        "°C"
                      )}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Blood Pressure</span>

                    <strong>
                      {latestVital.systolicBloodPressure !== null &&
                      latestVital.systolicBloodPressure !== undefined &&
                      latestVital.diastolicBloodPressure !== null &&
                      latestVital.diastolicBloodPressure !== undefined
                        ? `${latestVital.systolicBloodPressure}/${latestVital.diastolicBloodPressure} mmHg`
                        : "Not available"}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Oxygen Saturation</span>

                    <strong>
                      {formatValue(
                        latestVital.oxygenSaturation,
                        "%"
                      )}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Respiratory Rate</span>

                    <strong>
                      {formatValue(
                        latestVital.respiratoryRate,
                        "breaths/min"
                      )}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Source</span>

                    <strong>
                      {getSourceLabel(latestVital)}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Device</span>

                    <strong>
                      {latestVital.deviceId ||
                        "Not available"}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Device Type</span>

                    <strong>
                      {latestVital.deviceType ||
                        "Not available"}
                    </strong>
                  </div>


                  <div className="info-box">
                    <span>Recorded At</span>

                    <strong>
                      {formatDateTime(
                        latestVital.recordedAt
                      )}
                    </strong>
                  </div>

                </div>

              </>

            ) : (

              <p>
                No vital records available.
              </p>

            )}

          </div>


          {/* ========================= */}
          {/* VITAL HISTORY */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              📈 Vital History
            </div>

            {vitals.length > 0 ? (

              <div className="table-container">

                <table className="patient360-table">

                  <thead>

                    <tr>
                      <th>Date & Time</th>
                      <th>Heart Rate</th>
                      <th>Temperature</th>
                      <th>Blood Pressure</th>
                      <th>SpO₂</th>
                      <th>Respiratory Rate</th>
                      <th>Source</th>
                      <th>Device</th>
                    </tr>

                  </thead>

                  <tbody>

                    {[...vitals]
                      .sort(
                        (a, b) =>
                          new Date(b.recordedAt).getTime() -
                          new Date(a.recordedAt).getTime()
                      )
                      .map((vital) => (

                        <tr key={vital.id}>

                          <td>
                            {formatDateTime(
                              vital.recordedAt
                            )}
                          </td>

                          <td>
                            {formatValue(
                              vital.heartRate,
                              "BPM"
                            )}
                          </td>

                          <td>
                            {formatValue(
                              vital.temperature,
                              "°C"
                            )}
                          </td>

                          <td>
                            {vital.systolicBloodPressure !== null &&
                            vital.systolicBloodPressure !== undefined &&
                            vital.diastolicBloodPressure !== null &&
                            vital.diastolicBloodPressure !== undefined
                              ? `${vital.systolicBloodPressure}/${vital.diastolicBloodPressure} mmHg`
                              : "Not available"}
                          </td>

                          <td>
                            {formatValue(
                              vital.oxygenSaturation,
                              "%"
                            )}
                          </td>

                          <td>
                            {formatValue(
                              vital.respiratoryRate,
                              "breaths/min"
                            )}
                          </td>

                          <td>
                            {getSourceLabel(vital)}
                          </td>

                          <td>
                            {vital.deviceId ||
                              "Not available"}
                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            ) : (

              <p>
                No vital history available.
              </p>

            )}

          </div>


          {/* ========================= */}
          {/* APPOINTMENTS */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              📅 Appointments
            </div>

            {appointments.length > 0 ? (

              <div className="table-container">

                <table className="patient360-table">

                  <thead>

                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Doctor ID</th>
                    </tr>

                  </thead>

                  <tbody>

                    {appointments.map(
                      (appointment) => (

                        <tr key={appointment.id}>

                          <td>
                            {appointment.appointmentDate ||
                              "Not available"}
                          </td>

                          <td>
                            {appointment.appointmentTime ||
                              "Not available"}
                          </td>

                          <td>
                            {appointment.status ||
                              "Not available"}
                          </td>

                          <td>
                            {appointment.reason ||
                              "Not available"}
                          </td>

                          <td>
                            {appointment.doctorId ||
                              "Not available"}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <p>
                No appointments available.
              </p>

            )}

          </div>


          {/* ========================= */}
          {/* PRESCRIPTIONS */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              💊 Prescriptions
            </div>

            {prescriptions.length > 0 ? (

              <div className="table-container">

                <table className="patient360-table">

                  <thead>

                    <tr>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Instructions</th>
                      <th>Doctor ID</th>
                    </tr>

                  </thead>

                  <tbody>

                    {prescriptions.map(
                      (prescription) => (

                        <tr key={prescription.id}>

                          <td>
                            {prescription.medicineName ||
                              "Not available"}
                          </td>

                          <td>
                            {prescription.dosage ||
                              "Not available"}
                          </td>

                          <td>
                            {prescription.instructions ||
                              "Not available"}
                          </td>

                          <td>
                            {prescription.doctorId ||
                              "Not available"}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <p>
                No prescriptions available.
              </p>

            )}

          </div>


          {/* ========================= */}
          {/* DOCTORS */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              👨‍⚕️ Doctors
            </div>

            {doctors.length > 0 ? (

              <div className="table-container">

                <table className="patient360-table">

                  <thead>

                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>

                  </thead>

                  <tbody>

                    {doctors.map(
                      (doctor) => (

                        <tr key={doctor.id}>

                          <td>
                            {doctor.name ||
                              "Not available"}
                          </td>

                          <td>
                            {doctor.specialization ||
                              "Not available"}
                          </td>

                          <td>
                            {doctor.phone ||
                              "Not available"}
                          </td>

                          <td>
                            {doctor.email ||
                              "Not available"}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <p>
                No doctors available.
              </p>

            )}

          </div>


          {/* ========================= */}
          {/* RAW PATIENT 360 DATA */}
          {/* ========================= */}

          <div className="section-card">

            <div className="section-title">
              📋 Patient 360 Data
            </div>

            <pre className="json-viewer">
              {JSON.stringify(
                patientData,
                null,
                2
              )}
            </pre>

          </div>

        </div>

      )}

    </div>
  );
};

export default Patient360Page;