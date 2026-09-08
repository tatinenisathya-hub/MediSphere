import {
  getPatientName,
} from "../../utils/patientUtils";


function PrescriptionForm({
  form,
  setForm,
  patients,
  doctors,
  appointments,
  editingId,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="patient-form-card">

      <h2>
        {editingId
          ? "Edit Prescription"
          : "Create Prescription"}
      </h2>


      <form onSubmit={onSubmit}>


        {/* PATIENT */}

        <select
          value={form.patientId}
          onChange={(e) =>
            setForm({
              ...form,
              patientId: e.target.value,
            })
          }
          required
        >
          <option value="">
            Select Patient
          </option>

          {patients.map((patient) => (
            <option
              key={patient.id}
              value={patient.id}
            >
              {patient.name}
            </option>
          ))}

        </select>


        {/* DOCTOR */}

        <select
          value={form.doctorId}
          onChange={(e) =>
            setForm({
              ...form,
              doctorId: e.target.value,
            })
          }
          required
        >
          <option value="">
            Select Doctor
          </option>

          {doctors.map((doctor) => (
            <option
              key={doctor.id}
              value={doctor.id}
            >
              {doctor.name}
              {" - "}
              {doctor.specialization}
            </option>
          ))}

        </select>


        {/* APPOINTMENT */}

        <select
          value={form.appointmentId}
          onChange={(e) =>
            setForm({
              ...form,
              appointmentId: e.target.value,
            })
          }
          required
        >
          <option value="">
            Select Appointment
          </option>


          {appointments.map(
            (appointment) => (

              <option
                key={appointment.id}
                value={appointment.id}
              >

                {getPatientName(
                  patients,
                  appointment.patientId
                )}

                {" - "}

                {appointment.appointmentDate}

                {" "}

                {appointment.appointmentTime}

              </option>

            )
          )}

        </select>


        {/* MEDICINE */}

        <input
          type="text"
          placeholder="Medicine Name"
          value={form.medicineName}
          onChange={(e) =>
            setForm({
              ...form,
              medicineName: e.target.value,
            })
          }
          required
        />


        {/* DOSAGE */}

        <input
          type="text"
          placeholder="Dosage"
          value={form.dosage}
          onChange={(e) =>
            setForm({
              ...form,
              dosage: e.target.value,
            })
          }
          required
        />


        {/* INSTRUCTIONS */}

        <textarea
          placeholder="Instructions"
          value={form.instructions}
          onChange={(e) =>
            setForm({
              ...form,
              instructions: e.target.value,
            })
          }
          required
        />


        {/* SUBMIT */}

        <button
          type="submit"
          className="add-button"
        >
          {editingId
            ? "Update Prescription"
            : "Create Prescription"}
        </button>


        {/* CANCEL */}

        {editingId && (

          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

        )}

      </form>

    </div>
  );
}


export default PrescriptionForm;