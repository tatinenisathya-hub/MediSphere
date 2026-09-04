function Sidebar({ activePage, setActivePage }) {
  const pages = [
    "Dashboard",
    "Patients",
    "Doctors",
    "Appointments",
    "Prescriptions",
    "FHIR Integration",
    "Vitals",
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