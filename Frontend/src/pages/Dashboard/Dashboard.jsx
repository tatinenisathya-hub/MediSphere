import "./Dashboard.css";

import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";

import { getPatients } from "../../services/patientService";
import { getDoctors } from "../../services/doctorService";
import { getAppointments } from "../../services/appointmentService";
import { getPrescriptions } from "../../services/prescriptionService";


function Dashboard({ setActivePage }) {

  const [patients, setPatients] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  const [prescriptions, setPrescriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===============================
  // GLOBAL SEARCH
  // ===============================

  const [searchText, setSearchText] =
    useState("");


  // ===============================
  // LOAD DASHBOARD
  // ===============================

  const loadDashboard = async () => {

    setLoading(true);

    setError("");


    const results =
      await Promise.allSettled([

        getPatients(),

        getDoctors(),

        getAppointments(),

        getPrescriptions(),

      ]);


    let failed = false;


    if (
      results[0].status === "fulfilled"
    ) {

      setPatients(
        results[0].value || []
      );

    } else {

      failed = true;

    }


    if (
      results[1].status === "fulfilled"
    ) {

      setDoctors(
        results[1].value || []
      );

    } else {

      failed = true;

    }


    if (
      results[2].status === "fulfilled"
    ) {

      setAppointments(
        results[2].value || []
      );

    } else {

      failed = true;

    }


    if (
      results[3].status === "fulfilled"
    ) {

      setPrescriptions(
        results[3].value || []
      );

    } else {

      failed = true;

    }


    if (failed) {

      setError(
        "Some dashboard data could not be loaded. Please check the backend server."
      );

    }


    setLoading(false);

  };


  // ===============================
  // LOAD DATA
  // ===============================

  useEffect(() => {

    loadDashboard();

  }, []);


  // ===============================
  // APPOINTMENT COUNTS
  // ===============================

  const scheduledCount =
    appointments.filter(
      (item) =>
        item.status === "Scheduled"
    ).length;


  const completedCount =
    appointments.filter(
      (item) =>
        item.status === "Completed"
    ).length;


  const cancelledCount =
    appointments.filter(
      (item) =>
        item.status === "Cancelled"
    ).length;


  // ===============================
  // DASHBOARD CARDS
  // ===============================

  const cards = [

    {
      title: "Patients",
      count: patients.length,
      description:
        "Manage patient information",
      page: "Patients",
    },

    {
      title: "Doctors",
      count: doctors.length,
      description:
        "Manage doctor information",
      page: "Doctors",
    },

    {
      title: "Appointments",
      count: appointments.length,
      description:
        "Manage patient appointments",
      page: "Appointments",
    },

    {
      title: "Prescriptions",
      count: prescriptions.length,
      description:
        "Manage patient prescriptions",
      page: "Prescriptions",
    },

  ];


  // ===============================
  // GLOBAL SEARCH RESULTS
  // ===============================

  const searchResults = useMemo(() => {

    const search =
      searchText
        .trim()
        .toLowerCase();


    if (!search) {

      return [];

    }


    const results = [];


    // ===============================
    // PATIENTS
    // ===============================

    patients.forEach(
      (patient) => {

        const matches = [

          patient.name,

          patient.phone,

          patient.email,

          patient.id,

          patient.gender,

          patient.age,

        ]
          .map(
            (value) =>
              String(value || "")
                .toLowerCase()
          )
          .some(
            (value) =>
              value.includes(search)
          );


        if (matches) {

          results.push({

            type: "Patient",

            title:
              patient.name ||
              "Unnamed Patient",

            details:
              `Age: ${patient.age ?? "-"} | Gender: ${patient.gender || "-"}`,

            secondary:
              patient.phone ||
              patient.email ||
              patient.id ||
              "",

            page: "Patients",

            id: patient.id,

          });

        }

      }
    );


    // ===============================
    // DOCTORS
    // ===============================

    doctors.forEach(
      (doctor) => {

        const matches = [

          doctor.name,

          doctor.specialization,

          doctor.phone,

          doctor.email,

          doctor.id,

        ]
          .map(
            (value) =>
              String(value || "")
                .toLowerCase()
          )
          .some(
            (value) =>
              value.includes(search)
          );


        if (matches) {

          results.push({

            type: "Doctor",

            title:
              doctor.name ||
              "Unnamed Doctor",

            details:
              `Specialization: ${doctor.specialization || "-"}`,

            secondary:
              doctor.phone ||
              doctor.email ||
              doctor.id ||
              "",

            page: "Doctors",

            id: doctor.id,

          });

        }

      }
    );


    // ===============================
    // HELPER FUNCTIONS
    // ===============================

    const getPatientName =
      (patientId) => {

        const patient =
          patients.find(
            (item) =>
              item.id === patientId
          );


        return patient
          ? patient.name
          : patientId || "Unknown";

      };


    const getDoctorName =
      (doctorId) => {

        const doctor =
          doctors.find(
            (item) =>
              item.id === doctorId
          );


        return doctor
          ? doctor.name
          : doctorId || "Unknown";

      };


    // ===============================
    // APPOINTMENTS
    // ===============================

    appointments.forEach(
      (appointment) => {

        const patientName =
          getPatientName(
            appointment.patientId
          );

        const doctorName =
          getDoctorName(
            appointment.doctorId
          );


        const matches = [

          patientName,

          doctorName,

          appointment.patientId,

          appointment.doctorId,

          appointment.id,

          appointment.status,

          appointment.reason,

          appointment.appointmentDate,

          appointment.appointmentTime,

        ]
          .map(
            (value) =>
              String(value || "")
                .toLowerCase()
          )
          .some(
            (value) =>
              value.includes(search)
          );


        if (matches) {

          results.push({

            type: "Appointment",

            title:
              `${patientName} → ${doctorName}`,

            details:
              `${appointment.appointmentDate || "-"} ${appointment.appointmentTime || ""} | ${appointment.status || "-"}`,

            secondary:
              appointment.reason ||
              appointment.id ||
              "",

            page: "Appointments",

            id: appointment.id,

          });

        }

      }
    );


    // ===============================
    // PRESCRIPTIONS
    // ===============================

    prescriptions.forEach(
      (prescription) => {

        const patientName =
          getPatientName(
            prescription.patientId
          );

        const doctorName =
          getDoctorName(
            prescription.doctorId
          );


        const matches = [

          patientName,

          doctorName,

          prescription.patientId,

          prescription.doctorId,

          prescription.id,

          prescription.medicineName,

          prescription.dosage,

          prescription.instructions,

        ]
          .map(
            (value) =>
              String(value || "")
                .toLowerCase()
          )
          .some(
            (value) =>
              value.includes(search)
          );


        if (matches) {

          results.push({

            type: "Prescription",

            title:
              prescription.medicineName ||
              "Prescription",

            details:
              `Patient: ${patientName} | Doctor: ${doctorName}`,

            secondary:
              prescription.dosage ||
              prescription.instructions ||
              prescription.id ||
              "",

            page: "Prescriptions",

            id: prescription.id,

          });

        }

      }
    );


    return results;

  }, [

    searchText,

    patients,

    doctors,

    appointments,

    prescriptions,

  ]);


  // ===============================
  // CLEAR SEARCH
  // ===============================

  const handleClearSearch = () => {

    setSearchText("");

  };


  // ===============================
  // OPEN RESULT PAGE
  // ===============================

  const handleResultClick = (
    page
  ) => {

    setActivePage(page);

  };


  // ===============================
  // UI
  // ===============================

  return (

    <>

      <Header
        title="Dashboard"
        description="Welcome to MediSphere Healthcare Management System"
      />


      {error && (

        <p className="message">
          {error}
        </p>

      )}


      {/* ===============================
          GLOBAL SEARCH
      =============================== */}

      <section
        className="dashboard-search"
      >

        <div
          className="dashboard-search-header"
        >

          <div>

            <h2>
              Global Search
            </h2>

            <p>
              Search patients, doctors,
              appointments, and prescriptions
            </p>

          </div>


          {searchText && (

            <button
              type="button"
              className="dashboard-search-clear"
              onClick={
                handleClearSearch
              }
            >
              Clear
            </button>

          )}

        </div>


        <input
          type="text"
          value={searchText}
          onChange={(event) =>
            setSearchText(
              event.target.value
            )
          }
          placeholder="Search by name, ID, medicine, specialization, reason, status..."
          className="dashboard-search-input"
        />


        {/* ===============================
            SEARCH RESULTS
        =============================== */}

        {searchText.trim() !== "" && (

          <div
            className="dashboard-search-results"
          >

            {loading ? (

              <p className="dashboard-search-message">
                Loading search data...
              </p>

            ) : searchResults.length === 0 ? (

              <div
                className="dashboard-search-message"
              >

                <strong>
                  No matching records found.
                </strong>

                <span>
                  Try a different name, ID,
                  medicine, doctor, or appointment
                  detail.
                </span>

              </div>

            ) : (

              <>

                <div
                  className="dashboard-search-count"
                >

                  Found{" "}

                  <strong>
                    {searchResults.length}
                  </strong>{" "}

                  matching record
                  {searchResults.length !== 1
                    ? "s"
                    : ""}

                </div>


                <div
                  className="dashboard-search-list"
                >

                  {searchResults.map(
                    (result, index) => (

                      <button
                        type="button"
                        key={`${result.type}-${result.id || index}`}
                        className="dashboard-search-result"
                        onClick={() =>
                          handleResultClick(
                            result.page
                          )
                        }
                      >

                        <div
                          className="dashboard-result-main"
                        >

                          <span
                            className={`dashboard-result-type ${result.type
                              .toLowerCase()}`}
                          >
                            {result.type}
                          </span>


                          <strong>
                            {result.title}
                          </strong>

                        </div>


                        <div
                          className="dashboard-result-details"
                        >

                          {result.details}

                        </div>


                        {result.secondary && (

                          <div
                            className="dashboard-result-secondary"
                          >

                            {result.secondary}

                          </div>

                        )}


                        <span
                          className="dashboard-result-arrow"
                        >
                          →
                        </span>

                      </button>

                    )
                  )}

                </div>

              </>

            )}

          </div>

        )}

      </section>


      {/* ===============================
          DASHBOARD CARDS
      =============================== */}

      <section className="dashboard">

        {cards.map(
          (card) => (

            <div
              key={card.title}
              className="card clickable-card"
              onClick={() =>
                setActivePage(
                  card.page
                )
              }
            >

              <h3>
                {card.title}
              </h3>


              <div
                className="dashboard-count"
              >

                {loading
                  ? "..."
                  : card.count}

              </div>


              <p>
                {card.description}
              </p>

            </div>

          )
        )}

      </section>


      {/* ===============================
          DASHBOARD SUMMARY
      =============================== */}

      <section
        className="dashboard-summary"
      >

        <div className="summary-card">

          <h2>
            Appointment Summary
          </h2>


          <div className="summary-row">

            <span>
              Scheduled
            </span>

            <strong>
              {loading
                ? "..."
                : scheduledCount}
            </strong>

          </div>


          <div className="summary-row">

            <span>
              Completed
            </span>

            <strong>
              {loading
                ? "..."
                : completedCount}
            </strong>

          </div>


          <div className="summary-row">

            <span>
              Cancelled
            </span>

            <strong>
              {loading
                ? "..."
                : cancelledCount}
            </strong>

          </div>

        </div>


        {/* ===============================
            QUICK ACTIONS
        =============================== */}

        <div className="summary-card">

          <h2>
            Quick Actions
          </h2>


          <button
            className="quick-action-button"
            onClick={() =>
              setActivePage(
                "Patients"
              )
            }
          >
            Manage Patients
          </button>


          <button
            className="quick-action-button"
            onClick={() =>
              setActivePage(
                "Doctors"
              )
            }
          >
            Manage Doctors
          </button>


          <button
            className="quick-action-button"
            onClick={() =>
              setActivePage(
                "Appointments"
              )
            }
          >
            Manage Appointments
          </button>


          <button
            className="quick-action-button"
            onClick={() =>
              setActivePage(
                "Prescriptions"
              )
            }
          >
            Manage Prescriptions
          </button>

        </div>

      </section>

    </>

  );

}


export default Dashboard;