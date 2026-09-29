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
import Patient360Page from "./pages/Patient360/Patient360Page";
import ConsentPage from "./pages/Consent/ConsentPage";
import LaboratoryPage from "./pages/Laboratory/LaboratoryPage";
import AIRiskPredictionPage from "./pages/AIRiskPrediction/AIRiskPredictionPage";
import VitalAlerts from "./pages/VitalAlerts/VitalAlerts";
import DoctorNotifications from "./pages/DoctorNotifications/DoctorNotifications";
import PatientMonitoring from "./components/PatientMonitoring";
import CarePlansPage from "./pages/CarePlans/CarePlansPage";

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

      case "Patient 360":
        return <Patient360Page />;

      case "Consent":
        return <ConsentPage />;

      case "Laboratory Results":
        return <LaboratoryPage />;
      
      case "AI Risk Prediction":
        return <AIRiskPredictionPage />;

      case "Vital Alerts":
        return <VitalAlerts />;

      case "Doctor Notifications":
        return <DoctorNotifications />;

      case "Patient Monitoring":
        return <PatientMonitoring />;

      case "Care Plans & Treatment":
        return <CarePlansPage />;

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