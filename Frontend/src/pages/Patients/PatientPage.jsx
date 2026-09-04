import "./Patient.css";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Message from "../../components/Message";
import PatientForm from "./PatientForm";
import PatientList from "./PatientList";
import {
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from "../../services/patientService";

const emptyForm = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
};

function PatientPage({ onPatientsChanged }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
      onPatientsChanged?.(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setMessage("Unable to fetch patients. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const patient = {
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone,
      email: form.email,
    };

    try {
      setMessage("");

      if (editingId) {
        await updatePatient(editingId, patient);
        setMessage("Patient updated successfully!");
      } else {
        await createPatient(patient);
        setMessage("Patient added successfully!");
      }

      resetForm();
      await fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      setMessage(
        editingId
          ? "Failed to update patient."
          : "Failed to add patient. Please check the entered data."
      );
    }
  };

  const handleEdit = (patient) => {
    setForm({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
    });
    setEditingId(patient.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      setMessage("");
      await deletePatient(id);
      setMessage("Patient deleted successfully!");

      if (editingId === id) {
        resetForm();
      }

      await fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      setMessage("Failed to delete patient.");
    }
  };

  return (
    <>
      <Header title="Patients" description="Manage patient information" />
      <Message message={message} />

      <div className="patients-container">
        <PatientForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
        <PatientList
          patients={patients}
          loading={loading}
          onRefresh={fetchPatients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default PatientPage;