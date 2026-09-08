import "./Doctor.css";

import { useEffect, useState } from "react";

import Header from "../../components/Header";
import Message from "../../components/Message";
import FhirViewer from "../../components/FhirViewer";

import DoctorForm from "./DoctorForm";
import DoctorList from "./DoctorList";

import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from "../../services/doctorService";

import {
  getFhirPractitioner,
} from "../../services/fhirService";


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


  // ===============================
  // FHIR STATES
  // ===============================

  const [fhirData, setFhirData] = useState(null);

  const [fhirLoading, setFhirLoading] = useState(false);

  const [fhirTitle, setFhirTitle] =
    useState("FHIR Practitioner");


  // ===============================
  // FETCH DOCTORS
  // ===============================

  const fetchDoctors = async () => {

    try {

      setLoading(true);

      const data = await getDoctors();

      setDoctors(data);

    } catch (error) {

      console.error(
        "Error fetching doctors:",
        error
      );

      setMessage(
        "Unable to fetch doctors. Please check the backend server."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===============================
  // LOAD DOCTORS
  // ===============================

  useEffect(() => {

    fetchDoctors();

  }, []);


  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {

    setForm(emptyForm);

    setEditingId(null);

  };


  // ===============================
  // ADD / UPDATE DOCTOR
  // ===============================

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

        await updateDoctor(
          editingId,
          doctor
        );

        setMessage(
          "Doctor updated successfully!"
        );

      } else {

        await createDoctor(
          doctor
        );

        setMessage(
          "Doctor added successfully!"
        );

      }


      resetForm();

      await fetchDoctors();

    } catch (error) {

      console.error(
        "Error saving doctor:",
        error
      );

      setMessage(

        editingId

          ? "Failed to update doctor."

          : "Failed to add doctor."

      );

    }

  };


  // ===============================
  // EDIT DOCTOR
  // ===============================

  const handleEdit = (doctor) => {

    setForm({

      name: doctor.name || "",

      specialization:
        doctor.specialization || "",

      phone:
        doctor.phone || "",

      email:
        doctor.email || "",

    });


    setEditingId(
      doctor.id
    );

    setMessage("");

  };


  // ===============================
  // DELETE DOCTOR
  // ===============================

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this doctor?"
      )
    ) {

      return;

    }


    try {

      setMessage("");

      await deleteDoctor(id);


      setMessage(
        "Doctor deleted successfully!"
      );


      if (
        editingId === id
      ) {

        resetForm();

      }


      await fetchDoctors();

    } catch (error) {

      console.error(
        "Error deleting doctor:",
        error
      );

      setMessage(
        "Failed to delete doctor."
      );

    }

  };


  // ===============================
  // VIEW FHIR PRACTITIONER
  // ===============================

  const handleViewFhir = async (doctor) => {

    try {

      setFhirLoading(true);

      setMessage("");

      // Clear previous FHIR data
      setFhirData(null);


      const data =
        await getFhirPractitioner(
          doctor.id
        );


      // Convert response object to JSON string
      setFhirData(
        JSON.stringify(
          data,
          null,
          2
        )
      );


      setFhirTitle(
        `FHIR Practitioner - ${doctor.name}`
      );

    } catch (error) {

      console.error(
        "Error fetching FHIR Practitioner:",
        error
      );

      setMessage(
        "Failed to fetch FHIR Practitioner data."
      );

    } finally {

      setFhirLoading(false);

    }

  };


  // ===============================
  // CLOSE FHIR VIEWER
  // ===============================

  const handleCloseFhir = () => {

    setFhirData(null);

  };


  // ===============================
  // UI
  // ===============================

  return (

    <>

      <Header
        title="Doctors"
        description="Manage doctor information"
      />


      <Message
        message={message}
      />


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

          onViewFhir={handleViewFhir}

        />

      </div>


      {/* ===============================
          FHIR LOADING
      =============================== */}

      {fhirLoading && (

        <div className="fhir-loading">

          Loading FHIR Practitioner...

        </div>

      )}


      {/* ===============================
          FHIR VIEWER
      =============================== */}

      {fhirData && (

        <FhirViewer

          fhirData={fhirData}

          title={fhirTitle}

          onClose={handleCloseFhir}

        />

      )}

    </>

  );

}


export default DoctorPage;