function VitalsList({ vitals, patients, loading }) {
  // Find patient name using patientId
  const getPatientName = (patientId) => {
    if (!patients || patients.length === 0) {
      return patientId || "Unknown";
    }

    const patient = patients.find(
      (patient) => patient.id === patientId
    );

    return patient
      ? patient.name
      : patientId || "Unknown";
  };

  if (loading) {
    return (
      <div className="vitals-loading">
        Loading vitals...
      </div>
    );
  }

  if (!vitals || vitals.length === 0) {
    return (
      <div className="vitals-empty">
        No vital records found.
      </div>
    );
  }

  return (
    <div className="vitals-table-container">
      <table className="vitals-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Heart Rate</th>
            <th>Temperature</th>
            <th>Blood Pressure</th>
            <th>Oxygen</th>
            <th>Respiratory Rate</th>
            <th>Recorded At</th>
          </tr>
        </thead>

        <tbody>
          {vitals.map((vital) => (
            <tr key={vital.id}>
              {/* Patient Name */}
              <td>
                {getPatientName(vital.patientId)}
              </td>

              {/* Heart Rate */}
              <td>
                {vital.heartRate ?? "-"} BPM
              </td>

              {/* Temperature */}
              <td>
                {vital.temperature ?? "-"} °C
              </td>

              {/* Blood Pressure */}
              <td>
                {vital.systolicBloodPressure ?? "-"} /
                {" "}
                {vital.diastolicBloodPressure ?? "-"}
              </td>

              {/* Oxygen Saturation */}
              <td>
                {vital.oxygenSaturation ?? "-"} %
              </td>

              {/* Respiratory Rate */}
              <td>
                {vital.respiratoryRate ?? "-"} /min
              </td>

              {/* Recorded Date and Time */}
              <td>
                {vital.recordedAt
                  ? new Date(
                      vital.recordedAt
                    ).toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VitalsList;