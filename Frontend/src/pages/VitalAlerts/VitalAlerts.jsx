
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAllAlerts,
  updateAlertStatus,
} from "../../services/vitalAlertService";

import "./VitalAlerts.css";

const REFRESH_INTERVAL = 5000;

function VitalAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // Load alerts from backend
  // =========================================================

  const loadAlerts = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const data = await getAllAlerts();

      if (Array.isArray(data)) {
        setAlerts(data);
      } else {
        setAlerts([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load alerts:", err);

      setError(
        "Unable to load vital alerts. Please check whether the backend is running."
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  // =========================================================
  // Initial load and automatic refresh
  // =========================================================

  useEffect(() => {
    loadAlerts(true);

    const interval = setInterval(() => {
      loadAlerts(false);
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [loadAlerts]);

  // =========================================================
  // Get alert ID
  // =========================================================

  const getAlertId = (alert) => {
    return alert.id || alert._id;
  };

  // =========================================================
  // Update alert status
  // =========================================================

  const handleStatusChange = async (alertId, status) => {
    if (!alertId) {
      setError("Alert ID is missing.");
      return;
    }

    try {
      setUpdatingId(alertId);
      setError("");

      await updateAlertStatus(alertId, status);

      // Reload data from MongoDB after updating status
      await loadAlerts(false);
    } catch (err) {
      console.error("Failed to update alert status:", err);

      setError(
        "Unable to update alert status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // Filter alerts
  // =========================================================

  const filteredAlerts = useMemo(() => {
    if (filter === "ALL") {
      return alerts;
    }

    return alerts.filter((alert) => {
      const status = String(alert.status || "").toUpperCase();

      return status === filter;
    });
  }, [alerts, filter]);

  // =========================================================
  // Statistics
  // =========================================================

  const totalAlerts = alerts.length;

  const openAlerts = alerts.filter((alert) => {
    return String(alert.status || "").toUpperCase() === "OPEN";
  }).length;

  const acknowledgedAlerts = alerts.filter((alert) => {
    return (
      String(alert.status || "").toUpperCase() === "ACKNOWLEDGED"
    );
  }).length;

  const resolvedAlerts = alerts.filter((alert) => {
    return String(alert.status || "").toUpperCase() === "RESOLVED";
  }).length;

  const highSeverityAlerts = alerts.filter((alert) => {
    const severity = String(alert.severity || "").toUpperCase();
    const status = String(alert.status || "").toUpperCase();

    return severity === "HIGH" && status !== "RESOLVED";
  }).length;

  // =========================================================
  // Format date and time
  // =========================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // =========================================================
  // Get severity class
  // =========================================================

  const getSeverityClass = (severity) => {
    const value = String(severity || "").toUpperCase();

    switch (value) {
      case "HIGH":
        return "severity-high";

      case "MEDIUM":
        return "severity-medium";

      case "LOW":
        return "severity-low";

      default:
        return "severity-default";
    }
  };

  // =========================================================
  // Get status class
  // =========================================================

  const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    switch (value) {
      case "OPEN":
        return "status-open";

      case "ACKNOWLEDGED":
        return "status-acknowledged";

      case "RESOLVED":
        return "status-resolved";

      default:
        return "status-default";
    }
  };

  // =========================================================
  // Get vital unit
  // =========================================================

  const getUnit = (alert) => {
    if (alert.unit) {
      return alert.unit;
    }

    const type = String(alert.vitalType || "").toUpperCase();

    switch (type) {
      case "HEART_RATE":
        return "BPM";

      case "TEMPERATURE":
        return "°C";

      case "SYSTOLIC_BLOOD_PRESSURE":
        return "mmHg";

      case "DIASTOLIC_BLOOD_PRESSURE":
        return "mmHg";

      case "OXYGEN_SATURATION":
        return "%";

      case "RESPIRATORY_RATE":
        return "breaths/min";

      default:
        return "";
    }
  };

  // =========================================================
  // Loading screen
  // =========================================================

  if (loading) {
    return (
      <div className="vital-alerts-page">
        <div className="alerts-header">
          <div>
            <h1>Vital Alerts</h1>

            <p>
              Monitor abnormal wearable readings and manage patient alerts.
            </p>
          </div>
        </div>

        <div className="alerts-loading">
          <div className="loading-spinner"></div>

          <p>Loading vital alerts...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Main page
  // =========================================================

  return (
    <div className="vital-alerts-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="alerts-header">
        <div>
          <h1>Vital Alerts</h1>

          <p>
            Monitor abnormal wearable readings and manage patient alerts.
          </p>

          <div className="live-indicator">
            <span className="live-dot"></span>

            <span>Live Monitoring</span>

            {lastUpdated && (
              <span className="last-updated">
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}

            <span className="refresh-info">
              • Automatically refreshes every 5 seconds
            </span>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={() => loadAlerts(true)}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="alert-statistics">

        <div className="stat-card">
          <div className="stat-label">Total Alerts</div>

          <div className="stat-value">
            {totalAlerts}
          </div>

          <div className="stat-description">
            All recorded alerts
          </div>
        </div>

        <div className="stat-card stat-open">
          <div className="stat-label">Open Alerts</div>

          <div className="stat-value">
            {openAlerts}
          </div>

          <div className="stat-description">
            Require attention
          </div>
        </div>

        <div className="stat-card stat-high">
          <div className="stat-label">High Severity</div>

          <div className="stat-value">
            {highSeverityAlerts}
          </div>

          <div className="stat-description">
            Active high-risk readings
          </div>
        </div>

        <div className="stat-card stat-acknowledged">
          <div className="stat-label">Acknowledged</div>

          <div className="stat-value">
            {acknowledgedAlerts}
          </div>

          <div className="stat-description">
            Reviewed by staff
          </div>
        </div>

        <div className="stat-card stat-resolved">
          <div className="stat-label">Resolved</div>

          <div className="stat-value">
            {resolvedAlerts}
          </div>

          <div className="stat-description">
            Completed alerts
          </div>
        </div>

      </div>

      {/* =====================================================
          FILTER TOOLBAR
      ===================================================== */}

      <div className="alerts-toolbar">

        <div className="filter-section">
          <label htmlFor="alert-filter">
            Filter alerts
          </label>

          <select
            id="alert-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="ALL">
              All Alerts ({totalAlerts})
            </option>

            <option value="OPEN">
              Open ({openAlerts})
            </option>

            <option value="ACKNOWLEDGED">
              Acknowledged ({acknowledgedAlerts})
            </option>

            <option value="RESOLVED">
              Resolved ({resolvedAlerts})
            </option>
          </select>
        </div>

        <div className="history-label">
          Alert History
        </div>

      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredAlerts.length === 0 && (
        <div className="empty-alerts">

          <div className="empty-icon">
            ✓
          </div>

          <h2>No alerts found</h2>

          <p>
            There are no alerts matching the selected filter.
          </p>

        </div>
      )}

      {/* =====================================================
          ALERT LIST
      ===================================================== */}

      <div className="alerts-list">

        {filteredAlerts.map((alert) => {
          const alertId = getAlertId(alert);

          const status = String(
            alert.status || ""
          ).toUpperCase();

          const severity = String(
            alert.severity || ""
          ).toUpperCase();

          const isUpdating = updatingId === alertId;

          return (
            <div
              className={`alert-card ${getSeverityClass(severity)}`}
              key={alertId}
            >

              {/* =================================================
                  CARD HEADER
              ================================================= */}

              <div className="alert-card-header">

                <div className="alert-title-section">

                  <div className="vital-type">
                    {String(
                      alert.vitalType || "VITAL ALERT"
                    ).replaceAll("_", " ")}
                  </div>

                  <div className="patient-id">
                    Patient ID:{" "}

                    <strong>
                      {alert.patientId || "—"}
                    </strong>
                  </div>

                </div>

                <div
                  className={`severity-badge ${getSeverityClass(
                    severity
                  )}`}
                >
                  {severity || "UNKNOWN"}
                </div>

              </div>

              {/* =================================================
                  ALERT DETAILS
              ================================================= */}

              <div className="alert-details">

                <div className="detail-item">
                  <span className="detail-label">
                    Measured Value
                  </span>

                  <span className="detail-value measured-value">
                    {alert.measuredValue ?? "—"}{" "}
                    {getUnit(alert)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Device ID
                  </span>

                  <span className="detail-value">
                    {alert.deviceId || "—"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Recorded At
                  </span>

                  <span className="detail-value">
                    {formatDateTime(alert.recordedAt)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Alert Created
                  </span>

                  <span className="detail-value">
                    {formatDateTime(alert.createdAt)}
                  </span>
                </div>

              </div>

              {/* =================================================
                  ALERT MESSAGE
              ================================================= */}

              <div className="alert-message">

                <strong>
                  Alert Message
                </strong>

                <p>
                  {alert.message ||
                    "Abnormal vital reading detected."}
                </p>

              </div>

              {/* =================================================
                  CARD FOOTER
              ================================================= */}

              <div className="alert-card-footer">

                <div
                  className={`status-badge ${getStatusClass(
                    status
                  )}`}
                >
                  {status || "UNKNOWN"}
                </div>

                <div className="alert-actions">

                  {/* OPEN STATUS */}

                  {status === "OPEN" && (
                    <>
                      <button
                        className="acknowledge-button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            alertId,
                            "ACKNOWLEDGED"
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Acknowledge"}
                      </button>

                      <button
                        className="resolve-button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            alertId,
                            "RESOLVED"
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Resolve"}
                      </button>
                    </>
                  )}

                  {/* ACKNOWLEDGED STATUS */}

                  {status === "ACKNOWLEDGED" && (
                    <button
                      className="resolve-button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleStatusChange(
                          alertId,
                          "RESOLVED"
                        )
                      }
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Resolve"}
                    </button>
                  )}

                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* =====================================================
          FOOTER INFORMATION
      ===================================================== */}

      <div className="alerts-footer-info">

        <div>
          <strong>Monitoring Status:</strong>{" "}

          <span className="monitoring-active">
            Active
          </span>
        </div>

        <div>
          Wearable readings are evaluated against configured
          vital thresholds.
        </div>

      </div>

    </div>
  );
}

export default VitalAlerts;