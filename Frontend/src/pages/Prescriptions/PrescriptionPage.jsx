import "./Prescription.css";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Message from "../../components/Message";
import PrescriptionForm from "./PrescriptionForm";
import PrescriptionList from "./PrescriptionList";
import { getPatients } from "../../services/patientService";
import { getDoctors } from "../../services/doctorService";
import { getAppointments } from "../../services/appointmentService";
import {
  createPrescription,
  deletePrescription,
  getPrescriptions,
  updatePrescription,
} from "../../services/prescriptionService";
import { getPatientName } from "../../utils/patientUtils";

const emptyForm = {
  patientId: "",
  doctorId: "",
  appointmentId: "",
  medicineName: "",
  dosage: "",
  instructions: "",
};

function PrescriptionPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientData, doctorData, appointmentData, prescriptionData] =
        await Promise.all([
          getPatients(),
          getDoctors(),
          getAppointments(),
          getPrescriptions(),
        ]);

      setPatients(patientData);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      setPrescriptions(prescriptionData);
    } catch (error) {
      console.error("Error fetching prescription data:", error);
      setMessage(
        "Unable to fetch prescription data. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setPrescriptions(await getPrescriptions());
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setMessage("Unable to fetch prescriptions. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setMessage("");

      if (editingId) {
        await updatePrescription(editingId, form);
        setMessage("Prescription updated successfully!");
      } else {
        await createPrescription(form);
        setMessage("Prescription created successfully!");
      }

      resetForm();
      await fetchPrescriptions();
    } catch (error) {
      console.error("Error saving prescription:", error);
      setMessage(
        editingId
          ? "Failed to update prescription."
          : "Failed to create prescription."
      );
    }
  };

  const handleEdit = (prescription) => {
    setForm({
      patientId: prescription.patientId || "",
      doctorId: prescription.doctorId || "",
      appointmentId: prescription.appointmentId || "",
      medicineName: prescription.medicineName || "",
      dosage: prescription.dosage || "",
      instructions: prescription.instructions || "",
    });
    setEditingId(prescription.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      setMessage("");
      await deletePrescription(id);
      setMessage("Prescription deleted successfully!");

      if (editingId === id) resetForm();
      await fetchPrescriptions();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      setMessage("Failed to delete prescription.");
    }
  };

  return (
    <>
      <Header
        title="Prescriptions"
        description="Manage patient prescriptions"
      />
      <Message message={message} />

      <div className="patients-container">
        <PrescriptionForm
          form={form}
          setForm={setForm}
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          getPatientName={(id) => getPatientName(patients, id)}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
        <PrescriptionList
          prescriptions={prescriptions}
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          loading={loading}
          onRefresh={fetchData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default PrescriptionPage;