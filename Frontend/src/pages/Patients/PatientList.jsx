import Loading from "../../components/Loading";

function PatientList({ patients, loading, onRefresh, onEdit, onDelete }) {
  return (
    <div className="patient-list-card">
      <div className="list-header">
        <h2>Patient List</h2>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      {loading ? (
        <Loading text="Loading patients..." />
      ) : patients.length === 0 ? (
        <p className="no-data">No patients found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.email}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => onEdit(patient)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(patient.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientList;