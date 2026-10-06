import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import userProfileIcon from "../assets/patient.jpg";
import doctorProfileIcon from "../assets/Doctor.jpg";
import adminProfileIcon from "../assets/Admin.jpg";

const ROLE_PAGES = {
  ADMIN: [
    "Dashboard",
    "Patients",
    "Patient 360",
    "Doctors",
    "Appointments",
    "Prescriptions",
    "FHIR Integration",
    "Vitals",
    "Laboratory Results",
    "Consent",
    "AI Risk Prediction",
    "Vital Alerts",
    "Doctor Notifications",
    "Patient Monitoring",
    "Care Plans & Treatment",
  ],

  DOCTOR: [
    "Dashboard",
    "Patients",
    "Patient 360",
    "Doctors",
    "Appointments",
    "Prescriptions",
    "FHIR Integration",
    "Vitals",
    "Laboratory Results",
    "AI Risk Prediction",
    "Vital Alerts",
    "Doctor Notifications",
    "Patient Monitoring",
    "Care Plans & Treatment",
  ],

  PATIENT: [
    "Dashboard",
    "Patient 360",
    "Doctors",
    "Appointments",
    "Prescriptions",
    "FHIR Integration",
    "Vitals",
    "Laboratory Results",
    "AI Risk Prediction",
    "Vital Alerts",
    "Care Plans & Treatment",
  ],
};

function Sidebar({ activePage, setActivePage, role }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const pages = ROLE_PAGES[role] || [];

  const handlePageClick = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getDisplayRole = () => {
    if (!role) {
      return "User";
    }

    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  const getProfileIcon = () => {
    if (role === "DOCTOR") {
      return doctorProfileIcon;
    }

    if (role === "ADMIN") {
      return adminProfileIcon;
    }

    return userProfileIcon;
  };

  return (
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>

      {/* Sidebar Header */}
      <div className="sidebar-header">

        <div className="logo">
          <h2>MediSphere</h2>
          <p>Healthcare Management</p>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* Logged-in User */}
      <div className="sidebar-user">

        <img
          src={getProfileIcon()}
          alt={`${getDisplayRole()} profile`}
          className="sidebar-user-icon"
        />

        <div className="sidebar-user-info">
          <strong>{user?.name || "User"}</strong>
          <span>{getDisplayRole()}</span>
        </div>

      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation">

        {pages.map((page) => (
          <button
            key={page}
            className={activePage === page ? "active" : ""}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}

      </nav>

      {/* Logout */}
      <div className="sidebar-logout">

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;