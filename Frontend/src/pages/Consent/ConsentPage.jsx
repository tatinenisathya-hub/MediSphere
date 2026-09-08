import React, { useState } from "react";
import "./Consent.css";

import {
  grantConsent,
  getPatientConsents,
  revokeConsent,
  checkConsent,
} from "../../services/consentService";

const ConsentPage = () => {
  const [patientId, setPatientId] = useState("");

  const [consentType, setConsentType] =
    useState("WEARABLE_DATA");

  const [purpose, setPurpose] = useState(
    "Wearable health data collection"
  );

  const [consents, setConsents] = useState([]);

  const [activeConsent, setActiveConsent] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadConsents = async () => {
    if (!patientId.trim()) {
      setError("Please enter a Patient ID");
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await getPatientConsents(
        patientId.trim()
      );

      setConsents(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load patient consents"
      );

      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (event) => {
    event.preventDefault();

    if (!patientId.trim()) {
      setError("Please enter a Patient ID");
      setMessage("");
      return;
    }

    if (!consentType.trim()) {
      setError("Please select a consent type");
      setMessage("");
      return;
    }

    if (!purpose.trim()) {
      setError("Please enter the consent purpose");
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await grantConsent({
        patientId: patientId.trim(),
        consentType: consentType.trim(),
        purpose: purpose.trim(),
      });

      setMessage(
        "Consent granted successfully."
      );

      await loadConsents();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to grant consent"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this consent?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await revokeConsent(consentId);

      setMessage(
        "Consent revoked successfully."
      );

      await loadConsents();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to revoke consent"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConsent = async () => {
    if (!patientId.trim()) {
      setError("Please enter a Patient ID");
      setMessage("");
      return;
    }

    if (!consentType.trim()) {
      setError("Please select a consent type");
      setMessage("");
      return;
    }

    try {
      setChecking(true);
      setError("");
      setMessage("");

      const result = await checkConsent(
        patientId.trim(),
        consentType.trim()
      );

      setActiveConsent(result);

      if (result) {
        setMessage(
          `${consentType} consent is currently ACTIVE.`
        );
      } else {
        setMessage(
          `${consentType} consent is not active.`
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to check consent"
      );

      setActiveConsent(null);
    } finally {
      setChecking(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  return (
    <div className="consent-container">

      {/* HEADER */}

      <div className="consent-header">
        <div>
          <h1>Consent Management</h1>

          <p>
            Manage patient healthcare data
            permissions
          </p>
        </div>
      </div>

      {/* PATIENT SEARCH */}

      <div className="consent-card">

        <div className="consent-card-title">
          <span>🔐</span>
          <h2>Patient Consent</h2>
        </div>

        <div className="consent-form">

          <div className="form-group">
            <label>
              Patient ID
            </label>

            <input
              type="text"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(event) =>
                setPatientId(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>
              Consent Type
            </label>

            <select
              value={consentType}
              onChange={(event) =>
                setConsentType(event.target.value)
              }
            >
              <option value="WEARABLE_DATA">
                WEARABLE_DATA
              </option>

              <option value="DATA_SHARING">
                DATA_SHARING
              </option>

              <option value="FHIR_ACCESS">
                FHIR_ACCESS
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Purpose
            </label>

            <input
              type="text"
              placeholder="Enter consent purpose"
              value={purpose}
              onChange={(event) =>
                setPurpose(event.target.value)
              }
            />
          </div>

        </div>

        <div className="consent-actions">

          <button
            className="primary-button"
            onClick={handleGrantConsent}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : "Grant Consent"}
          </button>

          <button
            className="secondary-button"
            onClick={loadConsents}
            disabled={loading}
          >
            Load Consents
          </button>

          <button
            className="check-button"
            onClick={handleCheckConsent}
            disabled={checking}
          >
            {checking
              ? "Checking..."
              : "Check Active Consent"}
          </button>

        </div>

      </div>

      {/* STATUS */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ACTIVE CONSENT RESULT */}

      {activeConsent !== null && (
        <div
          className={
            activeConsent
              ? "consent-status active"
              : "consent-status inactive"
          }
        >
          <div className="status-icon">
            {activeConsent ? "✓" : "!"}
          </div>

          <div>
            <h3>
              {activeConsent
                ? "Consent Active"
                : "Consent Not Active"}
            </h3>

            <p>
              Patient ID: {patientId}
            </p>

            <p>
              Consent Type: {consentType}
            </p>
          </div>
        </div>
      )}

      {/* CONSENT HISTORY */}

      <div className="consent-card">

        <div className="consent-card-title">
          <span>📋</span>
          <h2>Consent History</h2>
        </div>

        {!loading &&
          consents.length === 0 && (
            <div className="empty-state">
              Enter a Patient ID and click
              <strong> Load Consents </strong>
              to view consent records.
            </div>
          )}

        {consents.length > 0 && (
          <div className="consent-table-wrapper">

            <table className="consent-table">

              <thead>
                <tr>
                  <th>Consent Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Granted At</th>
                  <th>Revoked At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {consents.map((consent) => (
                  <tr key={consent.id}>

                    <td>
                      <span className="consent-type">
                        {consent.consentType}
                      </span>
                    </td>

                    <td>
                      {consent.purpose || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          consent.status === "ACTIVE"
                            ? "status-badge active-badge"
                            : "status-badge revoked-badge"
                        }
                      >
                        {consent.status}
                      </span>
                    </td>

                    <td>
                      {formatDateTime(
                        consent.grantedAt
                      )}
                    </td>

                    <td>
                      {formatDateTime(
                        consent.revokedAt
                      )}
                    </td>

                    <td>

                      {consent.status ===
                        "ACTIVE" ? (
                        <button
                          className="revoke-button"
                          onClick={() =>
                            handleRevokeConsent(
                              consent.id
                            )
                          }
                          disabled={loading}
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="revoked-text">
                          Revoked
                        </span>
                      )}

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default ConsentPage;