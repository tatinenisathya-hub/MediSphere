function DoctorForm({ form, setForm, editingId, onSubmit, onCancel }) {
  return (
    <div className="patient-form-card">
      <h2>{editingId ? "Edit Doctor" : "Add New Doctor"}</h2>

      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Doctor Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Specialization"
          value={form.specialization}
          onChange={(e) =>
            setForm({ ...form, specialization: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <button type="submit" className="add-button">
          {editingId ? "Update Doctor" : "Add Doctor"}
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

export default DoctorForm;