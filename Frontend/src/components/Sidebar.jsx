function Sidebar({ activePage, setActivePage }) {
  const pages = [
    "Dashboard",
    "Patients",
    "Patient 360",
    "Doctors",
    "Appointments",
    "Prescriptions",
    "FHIR Integration",
    "Vitals",
    "Consent",
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>MediSphere</h2>
        <p>Healthcare Management</p>
      </div>

      <nav>
        {pages.map((page) => (
          <button
            key={page}
            className={activePage === page ? "active" : ""}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;