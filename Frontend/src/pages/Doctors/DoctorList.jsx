import Loading from "../../components/Loading";

function DoctorList({ doctors, loading, onRefresh, onEdit, onDelete }) {
  return (
    <div className="patient-list-card">
      <div className="list-header">
        <h2>Doctor List</h2>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      {loading ? (
        <Loading text="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <p className="no-data">No doctors found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.email}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => onEdit(doctor)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(doctor.id)}
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

export default DoctorList;