import "./Appointment.css";
import { useEffect, useState } from "react";

import Header from "../../components/Header";
import Message from "../../components/Message";
import FhirViewer from "../../components/FhirViewer";

import AppointmentForm from "./AppointmentForm";
import AppointmentList from "./AppointmentList";

import { getPatients } from "../../services/patientService";
import { getDoctors } from "../../services/doctorService";

import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../../services/appointmentService";

import {
  getFhirAppointment,
} from "../../services/fhirService";


const emptyForm = {
  patientId: "",
  doctorId: "",
  appointmentDate: "",
  appointmentTime: "",
  status: "Scheduled",
  reason: "",
};


function AppointmentPage() {

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");


  // ===============================
  // FHIR STATES
  // ===============================

  const [fhirData, setFhirData] = useState(null);

  const [fhirLoading, setFhirLoading] =
    useState(false);


  // ===============================
  // FETCH ALL DATA
  // ===============================

  const fetchData = async () => {

    try {

      setLoading(true);

      const [
        patientData,
        doctorData,
        appointmentData,
      ] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAppointments(),
      ]);

      setPatients(patientData || []);

      setDoctors(doctorData || []);

      setAppointments(appointmentData || []);

    } catch (error) {

      console.error(
        "Error fetching appointment data:",
        error
      );

      setMessage(
        "Unable to fetch appointment data. Please check the backend server."
      );

    } finally {

      setLoading(false);

    }
  };


  // ===============================
  // FETCH APPOINTMENTS ONLY
  // ===============================

  const fetchAppointments = async () => {

    try {

      setLoading(true);

      const data =
        await getAppointments();

      setAppointments(data || []);

    } catch (error) {

      console.error(
        "Error fetching appointments:",
        error
      );

      setMessage(
        "Unable to fetch appointments. Please check the backend server."
      );

    } finally {

      setLoading(false);

    }
  };


  // ===============================
  // LOAD DATA
  // ===============================

  useEffect(() => {

    fetchData();

  }, []);


  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {

    setForm(emptyForm);

    setEditingId(null);

  };


  // ===============================
  // CREATE / UPDATE APPOINTMENT
  // ===============================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      try {

        setMessage("");

        if (editingId) {

          await updateAppointment(
            editingId,
            form
          );

          setMessage(
            "Appointment updated successfully!"
          );

        } else {

          await createAppointment(
            form
          );

          setMessage(
            "Appointment created successfully!"
          );

        }

        resetForm();

        await fetchAppointments();

      } catch (error) {

        console.error(
          "Error saving appointment:",
          error
        );

        setMessage(

          editingId

            ? "Failed to update appointment."

            : "Failed to create appointment."

        );

      }

    };


  // ===============================
  // EDIT APPOINTMENT
  // ===============================

  const handleEdit =
    (appointment) => {

      setForm({

        patientId:
          appointment.patientId || "",

        doctorId:
          appointment.doctorId || "",

        appointmentDate:
          appointment.appointmentDate || "",

        appointmentTime:
          appointment.appointmentTime || "",

        status:
          appointment.status || "Scheduled",

        reason:
          appointment.reason || "",

      });

      setEditingId(
        appointment.id
      );

      setMessage("");

    };


  // ===============================
  // DELETE APPOINTMENT
  // ===============================

  const handleDelete =
    async (id) => {

      if (
        !window.confirm(
          "Are you sure you want to delete this appointment?"
        )
      ) {
        return;
      }

      try {

        setMessage("");

        await deleteAppointment(id);

        setMessage(
          "Appointment deleted successfully!"
        );

        if (
          editingId === id
        ) {

          resetForm();

        }

        await fetchAppointments();

      } catch (error) {

        console.error(
          "Error deleting appointment:",
          error
        );

        setMessage(
          "Failed to delete appointment."
        );

      }

    };


  // ===============================
  // VIEW FHIR APPOINTMENT
  // ===============================

  const handleViewFhir =
    async (appointmentId) => {

      try {

        setFhirLoading(true);

        setMessage("");

        // Clear previous FHIR data
        setFhirData(null);


        const data =
          await getFhirAppointment(
            appointmentId
          );


        console.log(
          "FHIR Appointment Response:",
          data
        );


        if (
          !data ||
          (typeof data === "object" &&
            Object.keys(data).length === 0)
        ) {

          setMessage(
            "No FHIR Appointment data available."
          );

          return;

        }


        setFhirData(
          data
        );

      } catch (error) {

        console.error(
          "Error fetching FHIR Appointment:",
          error
        );

        setMessage(
          "Failed to fetch FHIR Appointment data."
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
        title="Appointments"
        description="Manage patient appointments"
      />


      <Message
        message={message}
      />


      <div className="patients-container">

        <AppointmentForm

          form={form}

          setForm={setForm}

          patients={patients}

          doctors={doctors}

          editingId={editingId}

          onSubmit={handleSubmit}

          onCancel={resetForm}

        />


        <AppointmentList

          appointments={appointments}

          patients={patients}

          doctors={doctors}

          loading={loading}

          onRefresh={fetchData}

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

          Loading FHIR Appointment...

        </div>

      )}


      {/* ===============================
          FHIR VIEWER
      =============================== */}

      {fhirData && (

        <FhirViewer

          fhirData={fhirData}

          title="FHIR Appointment"

          onClose={handleCloseFhir}

        />

      )}

    </>

  );

}


export default AppointmentPage;