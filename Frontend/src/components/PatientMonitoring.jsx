
import React, { useCallback, useEffect, useState } from "react";

const VITALS_API_URL = "http://localhost:8080/api/vitals";
const ALERTS_API_URL = "http://localhost:8080/api/alerts";
const SSE_URL = "http://localhost:8080/api/notifications/stream";

const PatientMonitoring = () => {
  const [patientIdInput, setPatientIdInput] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [vitals, setVitals] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);

  const [error, setError] = useState("");
  const [alertError, setAlertError] = useState("");

  const [sseConnected, setSseConnected] = useState(false);

  // ==========================================
  // FETCH PATIENT VITALS
  // ==========================================

  const fetchPatientVitals = useCallback(async (patientId) => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${VITALS_API_URL}/patient/${encodeURIComponent(patientId)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patient vitals");
      }

      const data = await response.json();

      // Sort latest readings first
      const sortedVitals = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              new Date(b.recordedAt || 0) -
              new Date(a.recordedAt || 0)
          )
        : [];

      setVitals(sortedVitals);
    } catch (err) {
      console.error("Error fetching patient vitals:", err);

      setError("Unable to load patient vital readings.");
      setVitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // FETCH PATIENT ALERTS
  // ==========================================

  const fetchPatientAlerts = useCallback(async (patientId) => {
    if (!patientId) return;

    try {
      setAlertLoading(true);
      setAlertError("");

      const response = await fetch(
        `${ALERTS_API_URL}/patient/${encodeURIComponent(patientId)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patient alerts");
      }

      const data = await response.json();

      // Sort latest alerts first
      const sortedAlerts = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              new Date(
                b.recordedAt || b.createdAt || 0
              ) -
              new Date(
                a.recordedAt || a.createdAt || 0
              )
          )
        : [];

      setAlerts(sortedAlerts);
    } catch (err) {
      console.error("Error fetching patient alerts:", err);

      setAlertError("Unable to load patient alerts.");
      setAlerts([]);
    } finally {
      setAlertLoading(false);
    }
  }, []);

  // ==========================================
  // HANDLE PATIENT SEARCH
  // ==========================================

  const handlePatientSearch = (event) => {
    event.preventDefault();

    const patientId = patientIdInput.trim();

    if (!patientId) {
      setError("Please enter a patient ID.");
      return;
    }

    setSelectedPatientId(patientId);

    // Clear old patient's data immediately
    setVitals([]);
    setAlerts([]);
    setError("");
    setAlertError("");

    // Fetch selected patient's data
    fetchPatientVitals(patientId);
    fetchPatientAlerts(patientId);
  };

  // ==========================================
  // AUTOMATIC REFRESH EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {
    if (!selectedPatientId) return;

    const interval = setInterval(() => {
      fetchPatientVitals(selectedPatientId);
      fetchPatientAlerts(selectedPatientId);
    }, 5000);

    return () => clearInterval(interval);
  }, [
    selectedPatientId,
    fetchPatientVitals,
    fetchPatientAlerts,
  ]);

  // ==========================================
  // REAL-TIME SSE PATIENT NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (!selectedPatientId) {
      setSseConnected(false);
      return;
    }

    const eventSource = new EventSource(SSE_URL);

    const handleDoctorNotification = (event) => {
      try {
        const notification = JSON.parse(event.data);

        console.log(
          "SSE notification received:",
          notification
        );

        // Display notifications only for the selected patient
        if (
          String(notification.patientId) !==
          String(selectedPatientId)
        ) {
          return;
        }

        const realtimeAlert = {
          id:
            notification.alertId ||
            notification.notificationId,

          alertId: notification.alertId,

          notificationId: notification.notificationId,

          patientId: notification.patientId,

          vitalType: notification.vitalType,

          measuredValue: notification.measuredValue,

          unit: notification.unit,

          severity: notification.severity,

          message: notification.message,

          recordedAt: notification.recordedAt,

          createdAt: notification.createdAt,

          status: notification.status || "OPEN",
        };

        setAlerts((previousAlerts) => {
          const notificationId =
            realtimeAlert.notificationId;

          const alertId = realtimeAlert.alertId;

          const alreadyExists = previousAlerts.some(
            (alert) => {
              const sameAlertId =
                alertId &&
                (alert.alertId === alertId ||
                  alert.id === alertId);

              const sameNotificationId =
                notificationId &&
                alert.notificationId === notificationId;

              return (
                sameAlertId || sameNotificationId
              );
            }
          );

          // Prevent duplicate alerts
          if (alreadyExists) {
            return previousAlerts;
          }

          // Add new real-time alert at the beginning
          return [realtimeAlert, ...previousAlerts];
        });

        console.log(
          "Patient-specific real-time alert added:",
          realtimeAlert
        );
      } catch (err) {
        console.error(
          "Error processing SSE notification:",
          err
        );
      }
    };

    eventSource.addEventListener(
      "doctor-notification",
      handleDoctorNotification
    );

    eventSource.onopen = () => {
      console.log("SSE connection established");

      setSseConnected(true);
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");

      setSseConnected(false);
    };

    return () => {
      eventSource.removeEventListener(
        "doctor-notification",
        handleDoctorNotification
      );

      eventSource.close();

      setSseConnected(false);

      console.log("SSE connection closed");
    };
  }, [selectedPatientId]);

  // ==========================================
  // LATEST VITAL
  // ==========================================

  const latestVital =
    vitals.length > 0 ? vitals[0] : null;

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString();
  };

  // ==========================================
  // GET SEVERITY COLOR
  // ==========================================

  const getSeverityColor = (severity) => {
    const normalizedSeverity = String(
      severity || ""
    ).toUpperCase();

    switch (normalizedSeverity) {
      case "CRITICAL":
        return "#dc3545";

      case "HIGH":
        return "#fd7e14";

      case "MEDIUM":
        return "#ffc107";

      case "LOW":
        return "#198754";

      default:
        return "#6c757d";
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>
        Patient-Specific Monitoring
      </h1>

      {/* ======================================
          PATIENT SEARCH
      ====================================== */}

      <form
        onSubmit={handlePatientSearch}
        style={styles.form}
      >
        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientIdInput}
          onChange={(event) =>
            setPatientIdInput(event.target.value)
          }
          style={styles.input}
        />

        <button
          type="submit"
          style={styles.button}
        >
          Monitor Patient
        </button>
      </form>

      {/* ======================================
          SELECTED PATIENT
      ====================================== */}

      {selectedPatientId && (
        <div style={styles.patientInfo}>
          Monitoring Patient:{" "}
          <strong>{selectedPatientId}</strong>
        </div>
      )}

      {/* ======================================
          SSE CONNECTION STATUS
      ====================================== */}

      {selectedPatientId && (
        <div
          style={{
            ...styles.connectionStatus,
            color: sseConnected
              ? "#198754"
              : "#dc3545",
          }}
        >
          <span>
            {sseConnected ? "●" : "●"}
          </span>{" "}
          {sseConnected
            ? "Real-time monitoring connected"
            : "Real-time monitoring disconnected"}
        </div>
      )}

      {/* ======================================
          VITAL ERROR
      ====================================== */}

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      {/* ======================================
          VITAL LOADING
      ====================================== */}

      {loading && (
        <p style={styles.loading}>
          Loading patient vitals...
        </p>
      )}

      {/* ======================================
          LATEST VITAL CARDS
      ====================================== */}

      {latestVital && (
        <div style={styles.cards}>
          <VitalCard
            title="Heart Rate"
            value={latestVital.heartRate}
            unit="BPM"
          />

          <VitalCard
            title="Temperature"
            value={latestVital.temperature}
            unit="°C"
          />

          <VitalCard
            title="Oxygen Saturation"
            value={latestVital.oxygenSaturation}
            unit="%"
          />

          <VitalCard
            title="Respiratory Rate"
            value={latestVital.respiratoryRate}
            unit="Breaths/min"
          />

          <VitalCard
            title="Systolic BP"
            value={latestVital.systolicBloodPressure}
            unit="mmHg"
          />

          <VitalCard
            title="Diastolic BP"
            value={latestVital.diastolicBloodPressure}
            unit="mmHg"
          />
        </div>
      )}

      {selectedPatientId &&
        !loading &&
        vitals.length === 0 &&
        !error && (
          <p style={styles.emptyMessage}>
            No vital readings found for this patient.
          </p>
        )}

      {/* ======================================
          VITAL HISTORY
      ====================================== */}

      {vitals.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Vital History
          </h2>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>
                    Recorded At
                  </th>

                  <th style={styles.tableHeader}>
                    Heart Rate
                  </th>

                  <th style={styles.tableHeader}>
                    Temperature
                  </th>

                  <th style={styles.tableHeader}>
                    Oxygen
                  </th>

                  <th style={styles.tableHeader}>
                    Respiratory Rate
                  </th>

                  <th style={styles.tableHeader}>
                    Systolic BP
                  </th>

                  <th style={styles.tableHeader}>
                    Diastolic BP
                  </th>
                </tr>
              </thead>

              <tbody>
                {vitals.map((vital, index) => (
                  <tr
                    key={
                      vital.id ||
                      vital.eventId ||
                      `${vital.recordedAt}-${index}`
                    }
                  >
                    <td style={styles.tableCell}>
                      {formatDate(vital.recordedAt)}
                    </td>

                    <td style={styles.tableCell}>
                      {vital.heartRate ?? "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      {vital.temperature ?? "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      {vital.oxygenSaturation ?? "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      {vital.respiratoryRate ?? "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      {vital.systolicBloodPressure ?? "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      {vital.diastolicBloodPressure ?? "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================
          PATIENT ALERTS
      ====================================== */}

      {selectedPatientId && (
        <div style={styles.section}>
          <div style={styles.alertHeader}>
            <h2 style={styles.sectionTitle}>
              Patient Alerts
            </h2>

            <span style={styles.alertCount}>
              {alerts.length} Alerts
            </span>
          </div>

          {alertLoading && (
            <p style={styles.loading}>
              Loading patient alerts...
            </p>
          )}

          {alertError && (
            <p style={styles.error}>
              {alertError}
            </p>
          )}

          {!alertLoading &&
            !alertError &&
            alerts.length === 0 && (
              <p style={styles.emptyMessage}>
                No alerts found for this patient.
              </p>
            )}

          <div style={styles.alertList}>
            {alerts.map((alert, index) => (
              <div
                key={
                  alert.id ||
                  alert.alertId ||
                  alert.notificationId ||
                  `${alert.vitalType}-${alert.recordedAt}-${index}`
                }
                style={styles.alertCard}
              >
                <div style={styles.alertContent}>
                  <div style={styles.alertTitleRow}>
                    <h3 style={styles.alertTitle}>
                      {alert.vitalType ||
                        "Vital Alert"}
                    </h3>

                    <span
                      style={{
                        ...styles.severity,
                        backgroundColor:
                          getSeverityColor(
                            alert.severity
                          ),
                      }}
                    >
                      {alert.severity || "UNKNOWN"}
                    </span>
                  </div>

                  <p style={styles.alertMessage}>
                    {alert.message ||
                      "Abnormal vital reading detected."}
                  </p>

                  <p style={styles.alertDetails}>
                    <strong>
                      Measured Value:
                    </strong>{" "}
                    {alert.measuredValue ?? "N/A"}{" "}
                    {alert.unit || ""}
                  </p>

                  <p style={styles.alertDetails}>
                    <strong>
                      Recorded At:
                    </strong>{" "}
                    {formatDate(alert.recordedAt)}
                  </p>

                  <p style={styles.alertDetails}>
                    <strong>Status:</strong>{" "}
                    {alert.status || "OPEN"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VITAL CARD COMPONENT
// ==========================================

const VitalCard = ({ title, value, unit }) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        {title}
      </h3>

      <div style={styles.cardValue}>
        {value ?? "N/A"}

        <span style={styles.unit}>
          {unit}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// STYLES
// ==========================================

const styles = {
  container: {
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f7f9fc",
    minHeight: "100vh",
  },

  pageTitle: {
    fontSize: "28px",
    marginBottom: "18px",
    color: "#111827",
  },

  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },

  input: {
    padding: "11px 12px",
    width: "270px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    padding: "11px 20px",
    backgroundColor: "#2979ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },

  patientInfo: {
    marginBottom: "10px",
    fontSize: "16px",
    color: "#1f2937",
  },

  connectionStatus: {
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "15px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginTop: "20px",
    marginBottom: "30px",
  },

  card: {
    padding: "18px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    border: "1px solid #dbe3ef",
    boxShadow:
      "0 2px 6px rgba(0, 0, 0, 0.04)",
  },

  cardTitle: {
    fontSize: "15px",
    color: "#111827",
    marginBottom: "8px",
  },

  cardValue: {
    fontSize: "27px",
    fontWeight: "bold",
    color: "#111827",
  },

  unit: {
    fontSize: "12px",
    fontWeight: "normal",
    color: "#6b7280",
    marginLeft: "5px",
  },

  section: {
    marginTop: "30px",
    marginBottom: "30px",
  },

  sectionTitle: {
    fontSize: "20px",
    color: "#111827",
    marginBottom: "15px",
  },

  tableContainer: {
    width: "100%",
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #dbe3ef",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
  },

  tableHeader: {
    padding: "13px 11px",
    backgroundColor: "#203f68",
    color: "#ffffff",
    textAlign: "left",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  tableCell: {
    padding: "13px 11px",
    borderBottom: "1px solid #e5e7eb",
    color: "#1f2937",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  alertCount: {
    backgroundColor: "#e8eef8",
    color: "#203f68",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  alertList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  alertCard: {
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e0e6ef",
    borderRadius: "10px",
    boxShadow:
      "0 2px 5px rgba(0, 0, 0, 0.04)",
  },

  alertContent: {
    width: "100%",
  },

  alertTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  alertTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#111827",
  },

  alertMessage: {
    marginTop: "10px",
    marginBottom: "10px",
    color: "#374151",
    fontSize: "14px",
  },

  alertDetails: {
    margin: "5px 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  severity: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "11px",
  },

  loading: {
    color: "#2563eb",
    fontSize: "14px",
  },

  error: {
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "15px",
  },

  emptyMessage: {
    color: "#6b7280",
    fontSize: "14px",
    padding: "15px 0",
  },
};

export default PatientMonitoring;