import "./Dashboard.css";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { getPatients } from "../../services/patientService";
import { getDoctors } from "../../services/doctorService";
import { getAppointments } from "../../services/appointmentService";
import { getPrescriptions } from "../../services/prescriptionService";

function Dashboard({ setActivePage }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getPatients(),
      getDoctors(),
      getAppointments(),
      getPrescriptions(),
    ]);

    let failed = false;

    if (results[0].status === "fulfilled") setPatients(results[0].value);
    else failed = true;

    if (results[1].status === "fulfilled") setDoctors(results[1].value);
    else failed = true;

    if (results[2].status === "fulfilled") setAppointments(results[2].value);
    else failed = true;

    if (results[3].status === "fulfilled") setPrescriptions(results[3].value);
    else failed = true;

    if (failed) {
      setError("Some dashboard data could not be loaded. Please check the backend server.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const scheduledCount = appointments.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelledCount = appointments.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const cards = [
    {
      title: "Patients",
      count: patients.length,
      description: "Manage patient information",
      page: "Patients",
    },
    {
      title: "Doctors",
      count: doctors.length,
      description: "Manage doctor information",
      page: "Doctors",
    },
    {
      title: "Appointments",
      count: appointments.length,
      description: "Manage patient appointments",
      page: "Appointments",
    },
    {
      title: "Prescriptions",
      count: prescriptions.length,
      description: "Manage patient prescriptions",
      page: "Prescriptions",
    },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome to MediSphere Healthcare Management System"
      />

      {error && <p className="message">{error}</p>}

      <section className="dashboard">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card clickable-card"
            onClick={() => setActivePage(card.page)}
          >
            <h3>{card.title}</h3>
            <div className="dashboard-count">
              {loading ? "..." : card.count}
            </div>
            <p>{card.description}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-summary">
        <div className="summary-card">
          <h2>Appointment Summary</h2>
          <div className="summary-row">
            <span>Scheduled</span>
            <strong>{loading ? "..." : scheduledCount}</strong>
          </div>
          <div className="summary-row">
            <span>Completed</span>
            <strong>{loading ? "..." : completedCount}</strong>
          </div>
          <div className="summary-row">
            <span>Cancelled</span>
            <strong>{loading ? "..." : cancelledCount}</strong>
          </div>
        </div>

        <div className="summary-card">
          <h2>Quick Actions</h2>
          <button
            className="quick-action-button"
            onClick={() => setActivePage("Patients")}
          >
            Manage Patients
          </button>
          <button
            className="quick-action-button"
            onClick={() => setActivePage("Doctors")}
          >
            Manage Doctors
          </button>
          <button
            className="quick-action-button"
            onClick={() => setActivePage("Appointments")}
          >
            Manage Appointments
          </button>
          <button
            className="quick-action-button"
            onClick={() => setActivePage("Prescriptions")}
          >
            Manage Prescriptions
          </button>
        </div>
      </section>
    </>
  );
}

export default Dashboard;