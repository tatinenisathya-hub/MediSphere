import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";

import { getPatients } from "../../services/patientService";

import {
  addCarePlanOutcome,
  approveCarePlan,
  generateCarePlan,
  getCarePlans,
  updateCarePlanAdherence,
} from "../../services/carePlanService";

import "./CarePlansPage.css";

const initialOutcome = {
  metric: "Blood pressure (systolic)",
  value: "",
  unit: "mmHg",
  notes: "",
};

export default function CarePlansPage() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [provider, setProvider] = useState("");
  const [outcome, setOutcome] = useState(initialOutcome);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedId) || plans[0],
    [plans, selectedId]
  );

  // Load patients when the page is opened.
  useEffect(() => {
    getPatients()
      .then((rows) => {
        setPatients(rows || []);

        if (rows?.length) {
          setPatientId(rows[0].id);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Load care plans for the selected patient.
  const loadPlans = async (id = patientId) => {
    if (!id) {
      setPlans([]);
      setSelectedId("");
      return;
    }

    const rows = await getCarePlans(id);

    setPlans(rows || []);

    setSelectedId((current) =>
      rows?.some((plan) => plan.id === current)
        ? current
        : rows?.[0]?.id || ""
    );
  };

  useEffect(() => {
    if (!patientId) {
      setPlans([]);
      setSelectedId("");
      return;
    }

    loadPlans(patientId).catch((e) => setError(e.message));

    // Patient selection is the dependency; loadPlans intentionally uses the selected patient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // Common handler for API operations.
  const runAction = async (action, successMessage) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await action();
      await loadPlans();
      setNotice(successMessage);
    } catch (e) {
      setError(e.message || "The operation failed.");
    } finally {
      setBusy(false);
    }
  };

  // Generate a care-plan draft.
  const handleGenerate = () =>
    runAction(async () => {
      const plan = await generateCarePlan(patientId);

      await loadPlans(patientId);
      setSelectedId(plan.id);
    }, "A care-plan draft was generated.");

  // Update intervention adherence.
  const handleAdherence = (item, status) =>
    runAction(
      () =>
        updateCarePlanAdherence(
          selectedPlan.id,
          item.id,
          status,
          item.adherenceNotes || ""
        ),
      "Adherence status updated."
    );

  // Record a health outcome.
  const handleOutcome = (event) => {
    event.preventDefault();

    if (!outcome.metric.trim() || outcome.value === "") {
      setError("Enter an outcome metric and value.");
      return;
    }

    const numericValue = Number(outcome.value);

    if (!Number.isFinite(numericValue)) {
      setError("Enter a valid numeric outcome value.");
      return;
    }

    runAction(
      () =>
        addCarePlanOutcome(selectedPlan.id, {
          ...outcome,
          metric: outcome.metric.trim(),
          unit: outcome.unit.trim(),
          value: numericValue,
        }),
      "Outcome recorded."
    );

    setOutcome({ ...initialOutcome });
  };

  // Approve the care-plan draft.
  const handleApproval = () => {
    if (!provider.trim()) {
      setError("Enter the reviewing provider name or ID.");
      return;
    }

    runAction(
      () => approveCarePlan(selectedPlan.id, provider.trim()),
      "Care plan approved and saved."
    );
  };

  /*
   * Compare the two most recent measurements for each metric and unit.
   *
   * Measurements with different units are kept in separate groups.
   * If a date is missing or invalid, it is placed after valid dates.
   */
  const outcomeComparisons = useMemo(() => {
    const outcomes = selectedPlan?.outcomes || [];
    const groups = new Map();

    outcomes.forEach((entry) => {
      const metric = entry.metric?.trim();
      const unit = entry.unit?.trim() || "";
      const value = Number(entry.value);

      if (!metric || !Number.isFinite(value)) {
        return;
      }

      const key = `${metric.toLowerCase()}|${unit.toLowerCase()}`;

      if (!groups.has(key)) {
        groups.set(key, {
          metric,
          unit,
          entries: [],
        });
      }

      groups.get(key).entries.push(entry);
    });

    return Array.from(groups.values()).map((group) => {
      const entries = [...group.entries].sort((a, b) => {
        const dateA = new Date(a.recordedAt).getTime();
        const dateB = new Date(b.recordedAt).getTime();

        const validA = Number.isFinite(dateA);
        const validB = Number.isFinite(dateB);

        if (validA && validB) {
          return dateB - dateA;
        }

        if (validA) {
          return -1;
        }

        if (validB) {
          return 1;
        }

        return 0;
      });

      const latest = entries[0];
      const previous = entries[1];

      return {
        metric: group.metric,
        unit: group.unit,
        latest,
        previous,
        change: previous
          ? Number(latest.value) - Number(previous.value)
          : null,
      };
    });
  }, [selectedPlan]);

  if (loading) {
    return (
      <div className="careplan-page">
        <Header
          title="Care Plans & Treatment"
          description="Personalized care planning and progress tracking"
        />
        <p>Loading patients…</p>
      </div>
    );
  }

  return (
    <div className="careplan-page">
      <Header
        title="Care Plans & Treatment"
        description="Risk-informed care-plan drafts, adherence tracking, and health outcomes"
      />

      {/* Patient and care-plan selection */}
      <section className="careplan-toolbar">
        <label>
          Patient
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
            {patients.length === 0 && (
              <option value="">No patients found</option>
            )}

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} · {patient.id}
              </option>
            ))}
          </select>
        </label>

        <button
          className="careplan-primary"
          disabled={!patientId || busy}
          onClick={handleGenerate}
        >
          {busy ? "Working…" : "+ Generate care-plan draft"}
        </button>

        <label className="careplan-existing">
          Existing plan
          <select
            value={selectedPlan?.id || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={!plans.length}
          >
            {!plans.length && <option value="">No plans yet</option>}

            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.createdAt
                  ? new Date(plan.createdAt).toLocaleString()
                  : "Date unavailable"}{" "}
                · {plan.status}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Success and error messages */}
      {error && (
        <div className="careplan-message error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="careplan-message success" role="status">
          {notice}
        </div>
      )}

      {!patientId ? (
        <div className="careplan-empty">
          Add a patient to begin care planning.
        </div>
      ) : !selectedPlan ? (
        <div className="careplan-empty">
          <h2>No care plan available</h2>
          <p>
            Generate a draft using the patient's saved AI risk predictions.
          </p>
        </div>
      ) : (
        <>
          {/* Care-plan summary */}
          <section className="careplan-summary">
            <div>
              <span className="eyebrow">PATIENT</span>
              <h2>{selectedPlan.patientName || "Patient"}</h2>
              <p className="muted">ID: {selectedPlan.patientId}</p>
            </div>

            <div>
              <span className="eyebrow">STATUS</span>
              <span
                className={`status-pill ${
                  selectedPlan.status === "APPROVED"
                    ? "approved"
                    : "pending"
                }`}
              >
                {selectedPlan.status?.replaceAll("_", " ")}
              </span>
              <p className="muted">
                Created{" "}
                {selectedPlan.createdAt
                  ? new Date(selectedPlan.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div>
              <span className="eyebrow">ADHERENCE</span>
              <strong className="adherence-number">
                {selectedPlan.items?.length
                  ? Math.round(
                      (selectedPlan.items.filter(
                        (item) => item.status === "COMPLETED"
                      ).length /
                        selectedPlan.items.length) *
                        100
                    )
                  : 0}
                %
              </strong>
              <p className="muted">Items marked completed</p>
            </div>
          </section>

          {/* Clinical disclaimer */}
          <div className="careplan-disclaimer">
            {selectedPlan.clinicalDisclaimer}
          </div>

          {/* Risk context */}
          <section className="careplan-section">
            <div className="section-heading">
              <div>
                <h2>Risk context</h2>
                <p>
                  Latest saved predictions used to prepare this draft
                </p>
              </div>
            </div>

            {selectedPlan.riskReferences?.length ? (
              <div className="risk-grid">
                {selectedPlan.riskReferences.map((risk, index) => (
                  <div
                    className="risk-card"
                    key={`${risk.modelType}-${index}`}
                  >
                    <span>{risk.modelType}</span>

                    <strong>{risk.riskBand || "Not recorded"}</strong>

                    <small>
                      {risk.riskProbability == null
                        ? "Probability unavailable"
                        : `${(risk.riskProbability * 100).toFixed(
                            1
                          )}% probability`}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">
                No saved risk predictions were found when this draft was
                generated.
              </p>
            )}
          </section>

          {/* Care-plan interventions and adherence */}
          <section className="careplan-section">
            <div className="section-heading">
              <div>
                <h2>Care-plan interventions</h2>
                <p>
                  Update each item's adherence as progress is recorded.
                </p>
              </div>
            </div>

            <div className="careplan-items">
              {selectedPlan.items?.map((item, index) => (
                <article className="careplan-item" key={item.id}>
                  <div className="item-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="item-content">
                    <span className="item-category">
                      {item.category?.replaceAll("_", " ")}
                    </span>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <small>Frequency: {item.frequency}</small>

                    {item.adherenceNotes && (
                      <small>Note: {item.adherenceNotes}</small>
                    )}
                  </div>

                  <div className="item-status">
                    <label>
                      Adherence
                      <select
                        value={item.status || "NOT_STARTED"}
                        onChange={(e) =>
                          handleAdherence(item, e.target.value)
                        }
                        disabled={busy}
                      >
                        <option value="NOT_STARTED">Not started</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="SKIPPED">Skipped</option>
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Outcome measurement and comparison */}
          <section className="careplan-section outcomes-layout">
            <div>
              <div className="section-heading">
                <div>
                  <h2>Outcome measurement</h2>
                  <p>Record follow-up values to track changes over time.</p>
                </div>
              </div>

              <form className="outcome-form" onSubmit={handleOutcome}>
                <label>
                  Metric
                  <input
                    value={outcome.metric}
                    onChange={(e) =>
                      setOutcome({
                        ...outcome,
                        metric: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <div className="outcome-fields">
                  <label>
                    Value
                    <input
                      type="number"
                      step="any"
                      value={outcome.value}
                      onChange={(e) =>
                        setOutcome({
                          ...outcome,
                          value: e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    Unit
                    <input
                      value={outcome.unit}
                      onChange={(e) =>
                        setOutcome({
                          ...outcome,
                          unit: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <label>
                  Notes
                  <textarea
                    rows="2"
                    value={outcome.notes}
                    onChange={(e) =>
                      setOutcome({
                        ...outcome,
                        notes: e.target.value,
                      })
                    }
                  />
                </label>

                <button className="careplan-primary" disabled={busy}>
                  Record outcome
                </button>
              </form>
            </div>

            <div className="outcome-history">
              {/* Outcome comparison */}
              <h3>Outcome comparison</h3>

              {outcomeComparisons.length ? (
                outcomeComparisons.map((comparison) => (
                  <div
                    className="outcome-row"
                    key={`${comparison.metric}-${comparison.unit}`}
                  >
                    <div>
                      <strong>{comparison.metric}</strong>

                      <small>
                        Latest: {comparison.latest.value}{" "}
                        {comparison.unit}
                      </small>

                      {comparison.previous ? (
                        <small>
                          Previous: {comparison.previous.value}{" "}
                          {comparison.unit}
                        </small>
                      ) : (
                        <small>
                          Record another measurement to compare.
                        </small>
                      )}
                    </div>

                    <b>
                      {comparison.change === null
                        ? "—"
                        : `${
                            comparison.change > 0 ? "+" : ""
                          }${comparison.change.toFixed(2)} ${
                            comparison.unit
                          }`}
                    </b>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No outcome measurements available for comparison.
                </p>
              )}

              <p className="muted">
                Changes are numerical comparisons only and do not establish
                clinical improvement or deterioration.
              </p>

              {/* Recorded outcome history */}
              <h3>Recorded outcomes</h3>

              {selectedPlan.outcomes?.length ? (
                [...selectedPlan.outcomes]
                  .sort((a, b) => {
                    const dateA = new Date(a.recordedAt).getTime();
                    const dateB = new Date(b.recordedAt).getTime();

                    const validA = Number.isFinite(dateA);
                    const validB = Number.isFinite(dateB);

                    if (validA && validB) {
                      return dateB - dateA;
                    }

                    if (validA) {
                      return -1;
                    }

                    if (validB) {
                      return 1;
                    }

                    return 0;
                  })
                  .map((entry) => (
                    <div className="outcome-row" key={entry.id}>
                      <div>
                        <strong>{entry.metric}</strong>

                        <small>
                          {entry.recordedAt
                            ? new Date(
                                entry.recordedAt
                              ).toLocaleString()
                            : "Date unavailable"}
                        </small>

                        {entry.notes && <small>{entry.notes}</small>}
                      </div>

                      <b>
                        {entry.value} {entry.unit}
                      </b>
                    </div>
                  ))
              ) : (
                <p className="muted">No outcomes recorded yet.</p>
              )}
            </div>
          </section>

          {/* Provider approval */}
          <section className="careplan-approval">
            <div>
              <h2>Provider review</h2>
              <p>
                Approval records that a provider reviewed this draft. It
                does not replace clinical judgment.
              </p>
            </div>

            <div className="approval-actions">
              <input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Provider name or ID"
                disabled={selectedPlan.status === "APPROVED"}
              />

              <button
                onClick={handleApproval}
                disabled={
                  busy || selectedPlan.status === "APPROVED"
                }
              >
                {selectedPlan.status === "APPROVED"
                  ? "Approved"
                  : "Approve plan"}
              </button>
            </div>

            {selectedPlan.approvedBy && (
              <small>
                Approved by {selectedPlan.approvedBy} on{" "}
                {selectedPlan.approvedAt
                  ? new Date(
                      selectedPlan.approvedAt
                    ).toLocaleString()
                  : "Date unavailable"}
              </small>
            )}
          </section>
        </>
      )}
    </div>
  );
}