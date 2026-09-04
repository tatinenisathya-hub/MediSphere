import Loading from "../../components/Loading";
import { getPatientName } from "../../utils/patientUtils";
import { getDoctorName } from "../../utils/doctorUtils";
import { getAppointmentDetails } from "../../utils/appointmentUtils";

function PrescriptionList({
  prescriptions,
  patients,
  doctors,
  appointments,
  loading,
  onRefresh,
  onEdit,
  onDelete,
}) {
  return (
    <div className="patient-list-card">
      <div className="list-header">
        <h2>Prescription List</h2>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      {loading ? (
        <Loading text="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <p className="no-data">No prescriptions found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Appointment</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Instructions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{getPatientName(patients, prescription.patientId)}</td>
                  <td>{getDoctorName(doctors, prescription.doctorId)}</td>
                  <td>
                    {getAppointmentDetails(
                      appointments,
                      patients,
                      prescription.appointmentId
                    )}
                  </td>
                  <td>{prescription.medicineName}</td>
                  <td>{prescription.dosage}</td>
                  <td>{prescription.instructions}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => onEdit(prescription)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(prescription.id)}
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

export default PrescriptionList;