function PatientForm({ form, setForm, editingId, onSubmit, onCancel }) {
  return (
    <div className="patient-form-card">
      <h2>{editingId ? "Edit Patient" : "Add New Patient"}</h2>

      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Patient Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          min="1"
          required
        />

        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

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
          {editingId ? "Update Patient" : "Add Patient"}
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

export default PatientForm;