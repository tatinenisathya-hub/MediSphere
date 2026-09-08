import Loading from "../../components/Loading";

import {
  getPatientName,
} from "../../utils/patientUtils";

import {
  getDoctorName,
} from "../../utils/doctorUtils";


function PrescriptionList({
  prescriptions,
  patients,
  doctors,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onViewFhir,
  fhirLoading,
}) {
  return (
    <div className="patient-list-card">

      <div className="list-header">

        <h2>
          Prescription List
        </h2>

        <button
          type="button"
          onClick={onRefresh}
          className="refresh-button"
        >
          Refresh
        </button>

      </div>


      {loading ? (

        <Loading
          text="Loading prescriptions..."
        />

      ) : prescriptions.length === 0 ? (

        <p className="no-data">
          No prescriptions found.
        </p>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>Patient</th>

                <th>Doctor</th>

                <th>Medicine</th>

                <th>Dosage</th>

                <th>Instructions</th>

                <th>Actions</th>
              </tr>

            </thead>


            <tbody>

              {prescriptions.map(
                (prescription) => (

                  <tr
                    key={prescription.id}
                  >

                    <td>
                      {getPatientName(
                        patients,
                        prescription.patientId
                      )}
                    </td>


                    <td>
                      {getDoctorName(
                        doctors,
                        prescription.doctorId
                      )}
                    </td>


                    <td>
                      {prescription.medicineName}
                    </td>


                    <td>
                      {prescription.dosage}
                    </td>


                    <td>
                      {prescription.instructions}
                    </td>


                    <td>

                      <div className="action-buttons">


                        {/* VIEW FHIR */}

                        <button
                          type="button"
                          className="fhir-button"
                          disabled={fhirLoading}
                          onClick={() =>
                            onViewFhir(
                              prescription
                            )
                          }
                        >
                          {fhirLoading
                            ? "Loading..."
                            : "View FHIR"}
                        </button>


                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            onEdit(
                              prescription
                            )
                          }
                        >
                          Edit
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            onDelete(
                              prescription.id
                            )
                          }
                        >
                          Delete
                        </button>


                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}


export default PrescriptionList;