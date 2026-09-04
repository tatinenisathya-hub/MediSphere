import { getPatientName } from "./patientUtils";

export const getAppointmentDetails = (appointments, patients, id) => {
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return "Unknown Appointment";
  }

  return `${getPatientName(patients, appointment.patientId)} - ${appointment.appointmentDate} ${appointment.appointmentTime}`;
};