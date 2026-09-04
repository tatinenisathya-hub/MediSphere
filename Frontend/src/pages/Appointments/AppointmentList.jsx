import Loading from "../../components/Loading";
import { getPatientName } from "../../utils/patientUtils";
import { getDoctorName } from "../../utils/doctorUtils";

function AppointmentList({
  appointments,
  patients,
  doctors,
  loading,
  onRefresh,
  onEdit,
  onDelete,
}) {
  return (
    <div className="patient-list-card">
      <div className="list-header">
        <h2>Appointment List</h2>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      {loading ? (
        <Loading text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <p className="no-data">No appointments found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{getPatientName(patients, appointment.patientId)}</td>
                  <td>{getDoctorName(doctors, appointment.doctorId)}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTime}</td>
                  <td>{appointment.status}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => onEdit(appointment)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(appointment.id)}
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

export default AppointmentList;