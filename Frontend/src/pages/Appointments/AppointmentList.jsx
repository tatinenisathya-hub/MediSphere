import Loading from "../../components/Loading";

import {
  getPatientName,
} from "../../utils/patientUtils";

import {
  getDoctorName,
} from "../../utils/doctorUtils";


function AppointmentList({

  appointments,
  patients,
  doctors,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onViewFhir,

}) {


  return (

    <div className="patient-list-card">


      {/* ===============================
          LIST HEADER
      =============================== */}

      <div className="list-header">

        <h2>
          Appointment List
        </h2>


        <button
          type="button"
          onClick={onRefresh}
          className="refresh-button"
        >

          Refresh

        </button>

      </div>


      {/* ===============================
          LOADING
      =============================== */}

      {loading ? (

        <Loading
          text="Loading appointments..."
        />


      ) : !appointments ||
        appointments.length === 0 ? (

        <p className="no-data">

          No appointments found.

        </p>


      ) : (

        <div className="table-container">

          <table>


            {/* ===============================
                TABLE HEADER
            =============================== */}

            <thead>

              <tr>

                <th>
                  Patient
                </th>

                <th>
                  Doctor
                </th>

                <th>
                  Date
                </th>

                <th>
                  Time
                </th>

                <th>
                  Status
                </th>

                <th>
                  Reason
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            {/* ===============================
                TABLE BODY
            =============================== */}

            <tbody>

              {appointments.map(
                (appointment) => (

                  <tr
                    key={appointment.id}
                  >


                    {/* PATIENT */}

                    <td>

                      {getPatientName(
                        patients,
                        appointment.patientId
                      )}

                    </td>


                    {/* DOCTOR */}

                    <td>

                      {getDoctorName(
                        doctors,
                        appointment.doctorId
                      )}

                    </td>


                    {/* DATE */}

                    <td>

                      {appointment.appointmentDate || "-"}

                    </td>


                    {/* TIME */}

                    <td>

                      {appointment.appointmentTime || "-"}

                    </td>


                    {/* STATUS */}

                    <td>

                      {appointment.status || "-"}

                    </td>


                    {/* REASON */}

                    <td>

                      {appointment.reason || "-"}

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">


                        {/* ===============================
                            VIEW FHIR
                        =============================== */}

                        <button

                          type="button"

                          className="fhir-button"

                          onClick={() => {

                            if (
                              appointment.id
                            ) {

                              onViewFhir(
                                appointment.id
                              );

                            }

                          }}

                        >

                          View FHIR

                        </button>


                        {/* ===============================
                            EDIT
                        =============================== */}

                        <button

                          type="button"

                          className="edit-button"

                          onClick={() => {

                            onEdit(
                              appointment
                            );

                          }}

                        >

                          Edit

                        </button>


                        {/* ===============================
                            DELETE
                        =============================== */}

                        <button

                          type="button"

                          className="delete-button"

                          onClick={() => {

                            onDelete(
                              appointment.id
                            );

                          }}

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


export default AppointmentList;