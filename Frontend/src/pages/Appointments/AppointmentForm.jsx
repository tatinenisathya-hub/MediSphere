function AppointmentForm({
  form,
  setForm,
  patients,
  doctors,
  editingId,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="patient-form-card">
      <h2>{editingId ? "Edit Appointment" : "Create Appointment"}</h2>

      <form onSubmit={onSubmit}>
        <select
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
          required
        >
          <option value="">Select Patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>

        <select
          value={form.doctorId}
          onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.appointmentDate}
          onChange={(e) =>
            setForm({ ...form, appointmentDate: e.target.value })
          }
          required
        />

        <input
          type="time"
          value={form.appointmentTime}
          onChange={(e) =>
            setForm({ ...form, appointmentTime: e.target.value })
          }
          required
        />

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          required
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <textarea
          placeholder="Reason for appointment"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          required
        />

        <button type="submit" className="add-button">
          {editingId ? "Update Appointment" : "Create Appointment"}
        </button>

        {editingId && (
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default AppointmentForm;
