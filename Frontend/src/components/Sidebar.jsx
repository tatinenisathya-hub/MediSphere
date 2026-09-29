import { useState } from "react";

function Sidebar({ activePage, setActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pages = [
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
    "Care Plans & Treatment"
  ];

  const handlePageClick = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <h2>MediSphere</h2>
          <p>Healthcare Management</p>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

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
    </aside>
  );
}

export default Sidebar;