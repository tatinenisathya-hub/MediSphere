import { useMemo, useState } from "react";
import {
  deleteLabResult,
} from "../../services/laboratoryService";

function LaboratoryList({
  results,
  patients,
  onEdit,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const patientMap = useMemo(() => {
    const map = {};

    patients.forEach((patient) => {
      map[patient.id] = patient;
    });

    return map;
  }, [patients]);

  const filteredResults = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return results.filter((result) => {
      const patient = patientMap[result.patientId];

      const searchableText = [
        result.id,
        result.patientId,
        patient?.name,
        result.testName,
        result.testCode,
        result.value,
        result.unit,
        result.referenceRange,
        result.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        result.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [results, patientMap, search, statusFilter]);

  async function handleDelete(result) {
    const patient = patientMap[result.patientId];

    const confirmed = window.confirm(
      `Delete the laboratory result "${result.testName}"${
        patient?.name ? ` for ${patient.name}` : ""
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLabResult(result.id);
      onRefresh();
    } catch (error) {
      window.alert(
        error.message || "Unable to delete laboratory result."
      );
    }
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  return (
    <div className="laboratory-list-card">
      <div className="laboratory-section-header">
        <div>
          <h2>Laboratory Results</h2>
          <p>
            {filteredResults.length} result
            {filteredResults.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="laboratory-filters">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search patient, test, value, ID..."
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="FINAL">Final</option>
          <option value="PRELIMINARY">Preliminary</option>
          <option value="CORRECTED">Corrected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setSearch("");
            setStatusFilter("All");
          }}
        >
          Reset
        </button>
      </div>

      {filteredResults.length === 0 ? (
        <div className="laboratory-empty-state">
          No laboratory results found.
        </div>
      ) : (
        <div className="laboratory-table-wrapper">
          <table className="laboratory-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Value</th>
                <th>Reference Range</th>
                <th>Status</th>
                <th>Performed</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((result) => {
                const patient =
                  patientMap[result.patientId];

                return (
                  <tr key={result.id}>
                    <td>
                      <strong>
                        {patient?.name || "Unknown Patient"}
                      </strong>

                      <small>
                        {result.patientId}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {result.testName}
                      </strong>

                      {result.testCode && (
                        <small>
                          Code: {result.testCode}
                        </small>
                      )}
                    </td>

                    <td>
                      {result.value}{" "}
                      {result.unit || ""}
                    </td>

                    <td>
                      {result.referenceRange || "—"}
                    </td>

                    <td>
                      <span
                        className={`laboratory-status status-${(
                          result.status || ""
                        ).toLowerCase()}`}
                      >
                        {result.status || "—"}
                      </span>
                    </td>

                    <td>
                      {formatDate(result.performedAt)}
                    </td>

                    <td>
                      <div className="laboratory-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            onEdit(result)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleDelete(result)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LaboratoryList;