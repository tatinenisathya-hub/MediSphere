import "./Doctor.css";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Message from "../../components/Message";
import DoctorForm from "./DoctorForm";
import DoctorList from "./DoctorList";
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from "../../services/doctorService";

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
};

function DoctorPage() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setMessage("Unable to fetch doctors. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const doctor = {
      name: form.name,
      specialization: form.specialization,
      phone: form.phone,
      email: form.email,
    };

    try {
      setMessage("");

      if (editingId) {
        await updateDoctor(editingId, doctor);
        setMessage("Doctor updated successfully!");
      } else {
        await createDoctor(doctor);
        setMessage("Doctor added successfully!");
      }

      resetForm();
      await fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      setMessage(
        editingId ? "Failed to update doctor." : "Failed to add doctor."
      );
    }
  };

  const handleEdit = (doctor) => {
    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
    });
    setEditingId(doctor.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      setMessage("");
      await deleteDoctor(id);
      setMessage("Doctor deleted successfully!");

      if (editingId === id) resetForm();
      await fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      setMessage("Failed to delete doctor.");
    }
  };

  return (
    <>
      <Header title="Doctors" description="Manage doctor information" />
      <Message message={message} />

      <div className="patients-container">
        <DoctorForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
        <DoctorList
          doctors={doctors}
          loading={loading}
          onRefresh={fetchDoctors}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default DoctorPage;