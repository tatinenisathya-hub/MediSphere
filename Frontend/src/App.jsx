import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

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

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const PAGE_ROLES = {
  Dashboard: ["ADMIN", "DOCTOR", "PATIENT"],
  Patients: ["ADMIN", "DOCTOR"],
  "Patient 360": ["ADMIN", "DOCTOR", "PATIENT"],
  Doctors: ["ADMIN", "DOCTOR", "PATIENT"],
  Appointments: ["ADMIN", "DOCTOR", "PATIENT"],
  Prescriptions: ["ADMIN", "DOCTOR", "PATIENT"],
  "FHIR Integration": ["ADMIN", "DOCTOR", "PATIENT"],
  Vitals: ["ADMIN", "DOCTOR", "PATIENT"],
  "Laboratory Results": ["ADMIN", "DOCTOR", "PATIENT"],
  Consent: ["ADMIN", "PATIENT"],
  "AI Risk Prediction": ["ADMIN", "DOCTOR", "PATIENT"],
  "Vital Alerts": ["ADMIN", "DOCTOR", "PATIENT"],
  "Doctor Notifications": ["ADMIN", "DOCTOR"],
  "Patient Monitoring": ["ADMIN", "DOCTOR"],
  "Care Plans & Treatment": ["ADMIN", "DOCTOR", "PATIENT"],
};

const PAGE_COMPONENTS = {
  Dashboard,
  Patients: PatientPage,
  "Patient 360": Patient360Page,
  Doctors: DoctorPage,
  Appointments: AppointmentPage,
  Prescriptions: PrescriptionPage,
  "FHIR Integration": FhirPage,
  Vitals: VitalsPage,
  "Laboratory Results": LaboratoryPage,
  Consent: ConsentPage,
  "AI Risk Prediction": AIRiskPredictionPage,
  "Vital Alerts": VitalAlerts,
  "Doctor Notifications": DoctorNotifications,
  "Patient Monitoring": PatientMonitoring,
  "Care Plans & Treatment": CarePlansPage,
};

function HomePage() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");

  const allowedPages = Object.keys(PAGE_ROLES).filter((page) =>
    PAGE_ROLES[page].includes(user.role)
  );

  useEffect(() => {
    if (!allowedPages.includes(activePage)) {
      setActivePage("Dashboard");
    }
  }, [activePage, user.role]);

  const PageComponent =
    PAGE_COMPONENTS[allowedPages.includes(activePage) ? activePage : "Dashboard"];

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        role={user.role}
      />

      <main className="main-content">
        <PageComponent setActivePage={setActivePage} />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={[
        "ADMIN",
        "DOCTOR",
        "PATIENT",
      ]} />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;