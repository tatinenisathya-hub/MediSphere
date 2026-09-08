import { useMemo, useState } from "react";

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

  // ===============================
  // FILTER STATES
  // ===============================

  const [searchText, setSearchText] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");


  // ===============================
  // FILTER APPOINTMENTS
  // ===============================

  const filteredAppointments = useMemo(() => {

    const search =
      searchText
        .trim()
        .toLowerCase();


    return appointments.filter(
      (appointment) => {

        // ===============================
        // GET PATIENT / DOCTOR NAMES
        // ===============================

        const patientName =
          getPatientName(
            patients,
            appointment.patientId
          );

        const doctorName =
          getDoctorName(
            doctors,
            appointment.doctorId
          );


        // ===============================
        // SEARCH FILTER
        // ===============================

        const matchesSearch =
          !search ||

          String(patientName || "")
            .toLowerCase()
            .includes(search) ||

          String(doctorName || "")
            .toLowerCase()
            .includes(search) ||

          String(appointment.patientId || "")
            .toLowerCase()
            .includes(search) ||

          String(appointment.doctorId || "")
            .toLowerCase()
            .includes(search) ||

          String(appointment.id || "")
            .toLowerCase()
            .includes(search) ||

          String(appointment.reason || "")
            .toLowerCase()
            .includes(search);


        if (!matchesSearch) {
          return false;
        }


        // ===============================
        // STATUS FILTER
        // ===============================

        const appointmentStatus =
          String(
            appointment.status || ""
          )
            .trim()
            .toLowerCase();


        const matchesStatus =
          statusFilter === "ALL" ||

          appointmentStatus ===
            statusFilter.toLowerCase();


        if (!matchesStatus) {
          return false;
        }


        // ===============================
        // FROM DATE FILTER
        // ===============================

        if (
          fromDate &&
          appointment.appointmentDate <
            fromDate
        ) {

          return false;

        }


        // ===============================
        // TO DATE FILTER
        // ===============================

        if (
          toDate &&
          appointment.appointmentDate >
            toDate
        ) {

          return false;

        }


        return true;

      }
    );

  }, [
    appointments,
    patients,
    doctors,
    searchText,
    statusFilter,
    fromDate,
    toDate,
  ]);


  // ===============================
  // RESET FILTERS
  // ===============================

  const handleResetFilters = () => {

    setSearchText("");

    setStatusFilter("ALL");

    setFromDate("");

    setToDate("");

  };


  // ===============================
  // CHECK FILTER STATUS
  // ===============================

  const filtersApplied =
    searchText.trim() !== "" ||
    statusFilter !== "ALL" ||
    fromDate !== "" ||
    toDate !== "";


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
          SEARCH & FILTER SECTION
      =============================== */}

      <div
        style={{
          marginBottom: "20px",
          padding: "18px",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          background: "#f8fafc",
        }}
      >

        {/* ===============================
            SEARCH
        =============================== */}

        <div
          style={{
            marginBottom: "14px",
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Search Appointments
          </label>


          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search by patient, doctor, ID, or reason..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 13px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              fontSize: "14px",
              outline: "none",
            }}
          />

        </div>


        {/* ===============================
            FILTER ROW
        =============================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >


          {/* ===============================
              STATUS
          =============================== */}

          <div
            style={{
              flex: "1 1 180px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Status
            </label>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                fontSize: "14px",
                background: "white",
              }}
            >

              <option value="ALL">
                All Statuses
              </option>

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>


          {/* ===============================
              FROM DATE
          =============================== */}

          <div
            style={{
              flex: "1 1 180px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              From Date
            </label>


            <input
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                fontSize: "14px",
                background: "white",
              }}
            />

          </div>


          {/* ===============================
              TO DATE
          =============================== */}

          <div
            style={{
              flex: "1 1 180px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              To Date
            </label>


            <input
              type="date"
              value={toDate}
              onChange={(event) =>
                setToDate(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                fontSize: "14px",
                background: "white",
              }}
            />

          </div>


          {/* ===============================
              RESET
          =============================== */}

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!filtersApplied}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "7px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: filtersApplied
                ? "pointer"
                : "not-allowed",
              background: filtersApplied
                ? "#64748b"
                : "#cbd5e1",
              color: "white",
              minHeight: "40px",
            }}
          >
            Reset Filters
          </button>

        </div>

      </div>


      {/* ===============================
          RESULT COUNT
      =============================== */}

      {!loading &&
        appointments &&
        appointments.length > 0 && (

          <div
            style={{
              marginBottom: "12px",
              fontSize: "14px",
              color: "#64748b",
            }}
          >

            Showing{" "}

            <strong>
              {filteredAppointments.length}
            </strong>{" "}

            of{" "}

            <strong>
              {appointments.length}
            </strong>{" "}

            appointment
            {appointments.length !== 1
              ? "s"
              : ""}

          </div>

        )}


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


      ) : filteredAppointments.length === 0 ? (

        /* ===============================
           NO FILTER RESULTS
        =============================== */

        <div
          style={{
            textAlign: "center",
            padding: "30px 15px",
            color: "#64748b",
          }}
        >

          <p
            style={{
              marginBottom: "12px",
              fontSize: "15px",
            }}
          >
            No appointments match the
            selected search or filters.
          </p>


          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: "9px 16px",
              border: "none",
              borderRadius: "7px",
              background: "#64748b",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Clear Filters
          </button>

        </div>


      ) : (

        /* ===============================
           APPOINTMENT TABLE
        =============================== */

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

              {filteredAppointments.map(
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

                      {appointment.appointmentDate ||
                        "-"}

                    </td>


                    {/* TIME */}

                    <td>

                      {appointment.appointmentTime ||
                        "-"}

                    </td>


                    {/* STATUS */}

                    <td>

                      {appointment.status ||
                        "-"}

                    </td>


                    {/* REASON */}

                    <td>

                      {appointment.reason ||
                        "-"}

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