import { useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard/Dashboard";
import PatientPage from "./pages/Patients/PatientPage";
import DoctorPage from "./pages/Doctors/DoctorPage";
import AppointmentPage from "./pages/Appointments/AppointmentPage";
import PrescriptionPage from "./pages/Prescriptions/PrescriptionPage";
import FhirPage from "./pages/FHIR/FhirPage";
import VitalsPage from "./pages/Vitals/VitalsPage";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;

      case "Patients":
        return <PatientPage />;

      case "Doctors":
        return <DoctorPage />;

      case "Appointments":
        return <AppointmentPage />;

      case "Prescriptions":
        return <PrescriptionPage />;

      case "FHIR Integration":
        return <FhirPage />;

      case "Vitals":
        return <VitalsPage />;

      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;